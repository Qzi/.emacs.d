/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-9
 * Time: 下午2:44
 * To change this template use File | Settings | File Templates.
 */
var util = require('util'),
    events = require('events'),
    _ = require('underscore'),
    async = require('async'),
    redis = require('redis'),
    moment = require('moment'),
    winston = require('winston'),
    config = require('./config.json'),
    errDict = require(__dirname + '/sso_data_manager_redis_error_dict.js').errorDict;

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: './log/sso_data_manager_redis.log',
      maxsize:10485760,
      maxFiles:10
    })
  ]
});

exports.createConnection = function() {
  var conn = new SSODataManagerRedis();
  conn.setMaxListeners(0);
  return conn;
};

function SSODataManagerRedis() {
  events.EventEmitter.call(this);

  var that = this;

  this.redisClient = redis.createClient(config.redis.port, config.redis.host);

  this.redisClient.once('ready', function (){
    logger.info('Redis Connected on', config);
    that.emit('ready');
  });

  this.redisClient.once('end', function (err) {
    logger.info('Redis Disconnected', err);
    that.emit('end');
  });

  this.redisClient.on('error', function (err) {
    logger.error('Redis Error', err);
    that.emit('error', err);
  });
}
util.inherits(SSODataManagerRedis, events.EventEmitter);

SSODataManagerRedis.prototype.closeManager = function () {
  this.redisClient.quit();
};

SSODataManagerRedis.prototype.addNewUsers = function(arrUsers, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  var isInputParameterValid = _.isArray(arrUsers) && !_.isEmpty(arrUsers);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var multi = that.redisClient.multi();
  var arrUserIds = [];
  var arrFieldsToPick = ['cid', 'pwd', 'reg_time', 'ut', 'cer_time']; // 需要从请求数据的json提取的字段.

  _.each(arrUsers, function (objUser) {
    if (_.isString(objUser.uid) && !_.isEmpty(objUser.uid)) {

      arrUserIds.push(objUser.uid); // 收集uid到数组,以备后面批量更新权限等信息用.

      multi.SADD('up_users', objUser.uid); // 添加uid到集合up_users.

      // 从请求数据中提取字段保存到新的对象objUserInfo
      var objUserInfo = _.pick(objUser, arrFieldsToPick);
      multi.HMSET('u:' + objUser.uid, objUserInfo);

      if (!_.isEmpty(objUser.rights)) {
        _.each(objUser.rights, function (objRightItem) {
          multi.HSET('r:' + objUser.uid, objRightItem.mid, objRightItem.end_date);
        });
      }

      if (!_.isEmpty(objUser.mt)) {
        _.each(objUser.mt, function (objMtItem) {
          multi.HSET('mt:' + objUser.uid, objMtItem.mt_id, objMtItem.end_date);
        });
      }

      if (!_.isEmpty(objUser.bp)) {
        _.each(objUser.bp, function (objBpItem) {
          multi.HSET('bp:' + objUser.uid, objBpItem.bpt_id, objBpItem.amount);
        });
      }

    }
    else {
      logger.error('SSODataManagerRedis.addNewUsers: wrong uid', objUser);
    }
  }); // _.each

  multi.exec(function (err) {
    if (err) {
      logger.error('SSODataManagerRedis.addNewUsers: multi.exec error', err);
      var objErr = _.clone(errDict.USER.ADD_USER_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    async.parallel(
      [
        function (fnCallback) {
          that.generateRightsJsonBatch(arrUserIds, function (err) {
            if (err) {
              fnCallback(err);
              return;
            }
            fnCallback(null);
          });
        },
        function (fnCallback) {
          that.generateMemberTypeJsonBatch(arrUserIds, function (err) {
            if (err) {
              fnCallback(err);
              return;
            }
            fnCallback(null);
          });
        },
        function (fnCallback) {
          that.generateBonusPointJsonBatch(arrUserIds, function (err) {
            if (err) {
              fnCallback(err);
              return;
            }
            fnCallback(null);
          });
        }
      ],

      function (err) {
        if (err) {
          var objErr = _.clone(errDict.USER.ADD_USER_ERROR);
          objErr.err_msg = JSON.stringify(err);
          fnCallback(objErr);
          return;
        }
        fnCallback(null);
      }
    ); // async.parallel

  });
};

SSODataManagerRedis.prototype.updateUsers = function (arrUsersToUpdate, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  var isInputParameterValid = _.isArray(arrUsersToUpdate) && !_.isEmpty(arrUsersToUpdate);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var arrFieldsToPick = ['pwd', 'ut', 'cer_time', 'reg_time'];
  var multi = this.redisClient.multi();

  _.each(arrUsersToUpdate, function (objUser) {
    var strUserKey = 'u:' + objUser.uid;
    var objUpdateInfo = _.pick(objUser, arrFieldsToPick);
    multi.HMSET(strUserKey, objUpdateInfo);
  });

  multi.exec(function (err, replies) {
    if (!err) {
      fnCallback(null);
    }
    else {
      logger.error('SSODataManagerRedis.updateUsers: multi.exec', err);
      var objErr = _.clone(errDict.USER.UPDATE_USER_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
    }
  });
};

SSODataManagerRedis.prototype.syncDict = function (objDict, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  var isInputParameterValid = !_.isEmpty(objDict) && _.isObject(objDict);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var rc = this.redisClient;
  var multi = rc.multi();

  if (!_.isEmpty(objDict.mt_dict)) {
    var arrTransformedMT = _.map(objDict.mt_dict, function(obj){return _.values(obj);});
    var objDataMT = _.object(arrTransformedMT);
    multi.HMSET('member_type_dict', objDataMT);
  }

  if (!_.isEmpty(objDict.bpt_dict)) {
    var arrTransformedBPT = _.map(objDict.bpt_dict, function(obj){return _.values(obj);});
    var objDataBPT = _.object(arrTransformedBPT);
    multi.HMSET('bonus_point_type_dict', objDataBPT);
  }

  multi.EXEC(function (err) {
    if (err) {
      logger.error('SSODataManagerRedis.syncDict: multi.exec', err);
      var objErr = _.clone(errDict.DICT.SYNC_DICT_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    // 从集合up_users中读取本地所有用户
    rc.SMEMBERS('up_users', function(err, arrUserIds){
      if (err) {
        logger.error('SSODataManagerRedis.syncDict: rc.SMEMBERS', err);
        var objErr = _.clone(errDict.DICT.SYNC_DICT_ERROR);
        objErr.err_msg = JSON.stringify(err);
        fnCallback(objErr);
        return;
      }

      if (_.isEmpty(arrUserIds)) {
        fnCallback(null);
        return;
      }

      // 更新所有用户的mt和bp的cache
      async.parallel(
        [
          function (fnCallback) {
            that.generateMemberTypeJsonBatch(arrUserIds, function (err) {
              if (err) {
                fnCallback(err);
                return;
              }
              fnCallback(null);
            });
          },
          function (fnCallback) {
            that.generateBonusPointJsonBatch(arrUserIds, function (err) {
              if (err) {
                fnCallback(err);
                return;
              }
              fnCallback(null);
            });
          }
        ],

        function (err) {
          if (err) {
            var objErr = _.clone(errDict.DICT.SYNC_DICT_ERROR);
            objErr.err_msg = JSON.stringify(err);
            fnCallback(objErr);
            return;
          }
          fnCallback(null);
        }
      ); // async.parallel

    }); // rc.SMEMBERS
  }); // multi.EXEC
};

SSODataManagerRedis.prototype.updateRights = function (arrRightsData, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  var isInputParameterValid = _.isArray(arrRightsData) && !_.isEmpty(arrRightsData);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var multi = that.redisClient.multi();
  var arrUserIds = [];

  _.each(arrRightsData, function (objRightItem) {
    // objRightItem.rights: [{"mid": "1","end_date": 1356499845},{"mid": "2","end_date": 1356499845}]
    if (_.isString(objRightItem.uid) && !_.isEmpty(objRightItem.uid)) {
      arrUserIds.push(objRightItem.uid);

      // arrRights: [ [ '1', 1356499845 ], [ '2', 1356499845 ] ]
      var arrRights = _.map(objRightItem.rights, function (obj) {
        return _.values(obj);
      });

      // objRights: { '1': 1356499845, '2': 1356499845 }
      var objRights = _.object(arrRights);
      multi.HMSET('r:' + objRightItem.uid, objRights);
    }
    else {
      logger.error('SSODataManagerRedis.updateRights: 用户id错误.', objRightItem);
    }
  }); // _.each

  multi.exec(function(err, replies){
    if (err) {
      logger.error('SSODataManagerRedis.updateRights: multi.exec error', err);
      var objErr = _.clone(errDict.RIGHTS.UPDATE_RIGHTS_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    that.generateRightsJsonBatch(arrUserIds, function (err) {
      if (err) {
        var objErr = _.clone(errDict.RIGHTS.UPDATE_RIGHTS_ERROR);
        objErr.err_msg = JSON.stringify(err);
        fnCallback(objErr);
        return;
      }
      fnCallback(null);
    });

  }); // multi.exec

};

SSODataManagerRedis.prototype.deleteRights = function(arrRightsToDel, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  if (_.isEmpty(arrRightsToDel)) {
    fnCallback(null);
    return;
  }

  var isInputParameterValid = _.isArray(arrRightsToDel);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var multi = that.redisClient.multi();
  var arrUserIds = [];

  _.each(arrRightsToDel, function (objRightToDelItem) {
    if (_.isString(objRightToDelItem.uid) && !_.isEmpty(objRightToDelItem.uid)) {
      arrUserIds.push(objRightToDelItem.uid);
      _.each(objRightToDelItem.rights, function (mid) {
        multi.HDEL('r:' + objRightToDelItem.uid, mid);
      });
    }
    else {
      logger.error('SSODataManagerRedis.deleteRights: uid error', objRightToDelItem);
    }
  });

  multi.exec(function(err){
    if (err) {
      logger.error('SSODataManagerRedis.deleteRights: multi.exec error', err);
      var objErr = _.clone(errDict.RIGHTS.DELETE_RIGHTS_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    if (_.isEmpty(arrUserIds)) {
      fnCallback(null);
      return;
    }

    that.generateRightsJsonBatch(arrUserIds, function (err) {
      if (err) {
        var objErr = _.clone(errDict.RIGHTS.DELETE_RIGHTS_ERROR);
        objErr.err_msg = JSON.stringify(err);
        fnCallback(objErr);
        return;
      }
      fnCallback(null);
    });
  });
};

SSODataManagerRedis.prototype.updateMemberTypes = function(arrMemberTypes, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  var isInputParameterValid = _.isArray(arrMemberTypes) && !_.isEmpty(arrMemberTypes);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var multi = that.redisClient.multi();
  var arrUserIds = [];

  _.each(arrMemberTypes, function (objUserMtItem) {
    if (_.isString(objUserMtItem.uid) && !_.isEmpty(objUserMtItem.uid)) {
      arrUserIds.push(objUserMtItem.uid);
      _.each(objUserMtItem.mt, function (objMtItem) {
        multi.HSET('mt:' + objUserMtItem.uid, objMtItem.mt_id, objMtItem.end_date);
      });
    }
    else {
      logger.error('SSODataManagerRedis.updateMemberTypes: uid error.', objUserMtItem);
    }
  });

  multi.exec(function (err) {
    if (err) {
      logger.error('SSODataManagerRedis.updateMemberTypes: multi.exec error.', err);
      var objErr = _.clone(errDict.MEMBER_TYPE.UPDATE_MEMBER_TYPE_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    if (!_.isEmpty(arrUserIds)) {
      that.generateMemberTypeJsonBatch(arrUserIds, function(err){
        if (err) {
          var objErr = _.clone(errDict.MEMBER_TYPE.UPDATE_MEMBER_TYPE_ERROR);
          objErr.err_msg = JSON.stringify(err);
          fnCallback(objErr);
          return;
        }
        fnCallback(null);
      });
    }
    else {
      fnCallback(null);
    }
  });
};

SSODataManagerRedis.prototype.deleteMemberTypes = function(arrMTsToDel, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  if (_.isEmpty(arrMTsToDel)) {
    fnCallback(null);
    return;
  }

  var isInputParameterValid = _.isArray(arrMTsToDel);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var multi = that.redisClient.multi();
  var arrUserIds = [];

  _.each(arrMTsToDel, function (objUserMtItem) {
    if (_.isString(objUserMtItem.uid) && !_.isEmpty(objUserMtItem.uid)) {
      arrUserIds.push(objUserMtItem.uid);
      _.each(objUserMtItem.mt, function (strMtId) {
        multi.HDEL('mt:' + objUserMtItem.uid, strMtId);
      });
    }
    else {
      logger.error('SSODataManagerRedis.deleteMemberTypes: uid error.', objUserMtItem);
    }
  });

  multi.exec(function(err){
    if (err) {
      logger.error('SSODataManagerRedis.deleteMemberTypes: multi.exec error.', err);
      var objErr = _.clone(errDict.MEMBER_TYPE.DELETE_MEMBER_TYPE_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    if (_.isEmpty(arrUserIds)){
      fnCallback(null);
      return;
    }

    that.generateMemberTypeJsonBatch(arrUserIds, function (err) {
      if (err) {
        var objErr = _.clone(errDict.MEMBER_TYPE.DELETE_MEMBER_TYPE_ERROR);
        objErr.err_msg = JSON.stringify(err);
        fnCallback(objErr);
        return;
      }

      fnCallback(null);
    });
  });
};

SSODataManagerRedis.prototype.updateBonusPoint = function(arrUserBPs, fnCallback) {
  if (!_.isFunction(fnCallback)) return;

  var isInputParameterValid = _.isArray(arrUserBPs) && !_.isEmpty(arrUserBPs);
  if (!isInputParameterValid) {
    var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
    fnCallback(objErr);
    return;
  }

  var that = this;
  var multi = that.redisClient.multi();
  var arrUserIds = [];

  _.each(arrUserBPs, function (objUserBpItem) {
    // objUserBpItem: {"uid":"tempuser","bp":[{"bpt_id":"1","amount":"2000"},{"bpt_id":"2","amount":"380"}]}
    if (_.isString(objUserBpItem.uid) && !_.isEmpty(objUserBpItem.uid)) {
      arrUserIds.push(objUserBpItem.uid);

      // arrBPs: [ [ '1', '2000' ], [ '2', '380' ] ]
      var arrBPs = _.map(objUserBpItem.bp, function (bpObj) {
        return _.values(bpObj);
      });

      // objBPs: { '1': '2000', '2': '380' }
      var objBPs = _.object(arrBPs);

      multi.HMSET('bp:' + objUserBpItem.uid, objBPs);
    }
    else {
      logger.error('SSODataManagerRedis.updateBonusPoint: uid error.', objUserBpItem);
    }
  }); // _.each

  multi.exec(function(err){
    if (err) {
      logger.error('SSODataManagerRedis.updateBonusPoint: multi.exec error.', err);
      var objErr = _.clone(errDict.BONUS_POINT.UPDATE_BONUS_POINT_ERROR);
      objErr.err_msg = JSON.stringify(err);
      fnCallback(objErr);
      return;
    }

    if (_.isEmpty(arrUserIds)) {
      fnCallback(null);
      return;
    }

    that.generateBonusPointJsonBatch(arrUserIds, function (err) {
      if (err) {
        var objErr = _.clone(errDict.BONUS_POINT.UPDATE_BONUS_POINT_ERROR);
        objErr.err_msg = JSON.stringify(err);
        fnCallback(objErr);
        return;
      }
      fnCallback(null);
    });
  });
};


SSODataManagerRedis.prototype.generateRightsJsonBatch = function (arrUserIds, fnCallback) {

  var isUserIDsValid = !_.isEmpty(arrUserIds) && _.isArray(arrUserIds);
  if (!isUserIDsValid) {
    if (_.isFunction(fnCallback)) {
      var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
      fnCallback(objErr);
    }
    return;
  }

  var that = this;

  var generateRightsJson = function (strUid, fnCallback) {
    var rc = that.redisClient;
    // get strUid's rights from redis
    rc.HGETALL('r:' + strUid, function onGetRights(err, objRights) {
      if (err) {
        if (_.isFunction(fnCallback))
          fnCallback(err);
        return;
      }

      if (_.isNull(objRights)) {
        if (_.isFunction(fnCallback))
          fnCallback(null);
        return;
      }

      /*
       * objRights is like: { '1': '1356331884', '2': '1356333028' }
       * convert objRights to: [ [ '1', '1356331884' ], [ '2', '1356333028' ] ] in arrPairedRights via _.pairs
       * */
      var arrRights = [];
      var arrPairedRights = _.pairs(objRights);
      /*
       * arrRightItem is like: [ '1', '1356331884' ]
       * convert to:{ mid: '1', end_date: '2013-02-02' } via _.object function
       * */
      _.each(arrPairedRights, function onRightsIteration(arrRightItem) {
        var strMid = arrRightItem[0];
        var strEndDate = moment.unix(arrRightItem[1]).format('YYYY-MM-DD');
        var objRight = _.object(
          ['mid', 'end_date'], // keys
          [strMid, strEndDate]  // values
        );
        arrRights.push(objRight);
      }); // _.each

      rc.HSET('u:' + strUid, 'rights', JSON.stringify(arrRights), function onSetRightJson(err) {
        if (err) {
          if (_.isFunction(fnCallback))
            fnCallback(err);
          return;
        }

        if (_.isFunction(fnCallback))
          fnCallback(null);
      }); // rc.HSET
    }); // rc.HGETALL
  };

  // async库的each方法, 用于并行执行方法, 详见: https://github.com/caolan/async#each.
  async.each(
    arrUserIds,
    generateRightsJson,
    function onGenerateRightsJsonBatchEnd(err) {
      if (err) {
        logger.error('SSODataManagerRedis.generateRightsJsonBatch: async.each error.', err);
        var objErr = _.clone(errDict.COMMON.INTERNAL_ERROR);
        objErr.err_msg = JSON.stringify(err);
        if (_.isFunction(fnCallback))
          fnCallback(objErr);
        return;
      }

      if (_.isFunction(fnCallback))
        fnCallback(null);
    }
  );

};

SSODataManagerRedis.prototype.generateMemberTypeJsonBatch = function (arrUserIds, fnCallback) {

  var isUserIDsValid = !_.isEmpty(arrUserIds) && _.isArray(arrUserIds);
  if (!isUserIDsValid) {
    if (_.isFunction(fnCallback)) {
      var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
      fnCallback(objErr);
    }
    return;
  }

  var that = this;

  var generateMemberTypeJson = function (strUid, fnCallback) {
    var rc = that.redisClient;
    var strMtKey = 'mt:' + strUid;
    var strUserKey = 'u:' + strUid;

    // 读取某个用户下的所有会员类型数据
    rc.HGETALL(strMtKey, function onGetMtData(err, objMemberType) {
      if (err) {
        if (_.isFunction(fnCallback))
          fnCallback(err);
        return;
      }

      if (_.isEmpty(objMemberType)) {
        rc.HSET(strUserKey, 'mt', '');
        if (_.isFunction(fnCallback))
          fnCallback(null);
        return;
      }

      /*
       * 会员类型不为空,根据mt_id,从member_type_dict中找到mt_name,最后生成目标json串
       * objMemberType 数据举例: {'1':1356331884,'2':1356331884}
       * arrPairedMT 数据举例(通过 _.pairs将objMemberType转换后获得): [ [ '1', 1356331884 ], [ '2', 1356331884 ] ]
       * arrMT : 用来保存一个用户的多条会员类型数据.最后会把它转成json字符串
       * */
      var arrMT = [];
      var arrPairedMT = _.pairs(objMemberType);

      // async库的each方法, 用于并行执行方法, 详见: https://github.com/caolan/async#each.
      async.each(
        arrPairedMT,

        function onMtIteration(arrMtItem, fnCallback) {
          // arrMtItem: [ '1', 1356331884 ]
          var strMtId = arrMtItem[0];
          var strEndDate = moment.unix(arrMtItem[1]).format('YYYY-MM-DD');

          rc.HGET('member_type_dict', strMtId, function onGetMtDictData(err, mtName) {
            if (err) {
              if (_.isFunction(fnCallback))
                fnCallback(err);
              return;
            }

            var objMt = _.object(
              ['mt_id', 'mt_name', 'end_date'],
              [strMtId, mtName, strEndDate]
            );

            arrMT.push(objMt);

            if (_.isFunction(fnCallback))
              fnCallback(null);
          });
        },

        function onMtIterationEnd(err) {
          if (err) {
            if (_.isFunction(fnCallback))
              fnCallback(err);
            return;
          }

          rc.HSET(strUserKey, 'mt', JSON.stringify(arrMT), function onSetUserMtData() {
            if (err) {
              if (_.isFunction(fnCallback))
                fnCallback(err);
              return;
            }

            if (_.isFunction(fnCallback))
              fnCallback(null);
          });
        }
      ); // async.each

    }); // rc.HGETAL
  };

  // async库的each方法, 用于并行执行方法, 详见: https://github.com/caolan/async#each.
  async.each(
    arrUserIds,

    generateMemberTypeJson,

    function onGenerateMtJsonBatchEnd(err) {
      if (err) {
        logger.error('SSODataManagerRedis.generateMemberTypeJsonBatch error.', err);
        var errResult = _.clone(errDict.COMMON.INTERNAL_ERROR);
        errResult.err_msg = JSON.stringify(err);
        if (_.isFunction(fnCallback))
          fnCallback(errResult);
        return;
      }

      if (_.isFunction(fnCallback))
        fnCallback(null);
    }
  );
}


SSODataManagerRedis.prototype.generateBonusPointJsonBatch = function (arrUserIds, fnCallback) {
  var isUserIDsValid = !_.isEmpty(arrUserIds) && _.isArray(arrUserIds);
  if (!isUserIDsValid) {
    if (_.isFunction(fnCallback)) {
      var objErr = _.clone(errDict.COMMON.INPUT_PARAMETER_INVALID);
      fnCallback(objErr);
    }
    return;
  }

  var that = this;

  var generateBonusPointJson = function (strUid, fnCallback) {
    var rc = that.redisClient;
    var strUidKey = 'u:' + strUid;

    rc.HGETALL('bp:'+strUid, function onGetBpData(err, objBP) {
      if (err) {
        if (_.isFunction(fnCallback))
          fnCallback(err);
        return;
      }

      if (_.isNull(objBP)) {
        rc.HSET(strUidKey, 'bp', '', function(err, reply){
          if (err) {
            if (_.isFunction(fnCallback))
              fnCallback(err);
            return;
          }

          if (_.isFunction(fnCallback))
            fnCallback(null);
        });
        return;
      }

      /*
       * objBP is like: { '1': '2000', '2': '380' }
       * convert it to: [['1', '2000'], ['2', '380']] in arrPairedBP via _.pairs
       * */
      var arrPairedBP = _.pairs(objBP);
      var arrBP = [];

      // async库的each方法, 用于并行执行方法, 详见: https://github.com/caolan/async#each.
      async.each(
        arrPairedBP,

        function onBpIteration(arrBpItem, fnCallback) { // arrBpItem: ['1', '2000']
          var strBptId = arrBpItem[0];
          var strBP = arrBpItem[1];
          rc.HGET('bonus_point_type_dict', strBptId, function (err, strBbtName) {
            if (err) {
              if (_.isFunction(fnCallback))
                fnCallback(err);
              return;
            }

            // convert to:{ bpt_id: '1', bpt_name: '积分', amount: '2000' }
            var objBP = _.object(
              ['bpt_id', 'bpt_name', 'amount'],
              [strBptId, strBbtName, strBP]
            );

            arrBP.push(objBP);

            if (_.isFunction(fnCallback))
              fnCallback(null);
          });
        }, // function onBpIteration

        function onBpIterationEnd(err) {
          if (err) {
            if (_.isFunction(fnCallback))
              fnCallback(err);
            return;
          }

          rc.HSET(strUidKey, 'bp', JSON.stringify(arrBP), function onSetBp(err) {
            if (err) {
              if (_.isFunction(fnCallback))
                fnCallback(err);
              return;
            }

            if (_.isFunction(fnCallback))
              fnCallback(null);
          });
        } // function onBpIterationEnd

      ); // async.each

    }); // rc.HGETALL
  };

  // async库的each方法, 用于并行执行方法, 详见: https://github.com/caolan/async#each.
  async.each(
    arrUserIds,
    generateBonusPointJson,
    function onGenerateBPJsonBatchEnd(err) {
      if (err) {
        logger.error('SSODataManagerRedis.generateBonusPointJsonBatch error.', err);
        var objErr = _.clone(errDict.COMMON.INTERNAL_ERROR);
        objErr.err_msg = JSON.stringify(err);
        if (_.isFunction(fnCallback))
          fnCallback(objErr);
        return;
      }

      if (_.isFunction(fnCallback))
        fnCallback(null);
    }
  );

};


SSODataManagerRedis.prototype.getUserInfoAll = function (aUid) {
  var that = this;
  if (_.isEmpty(aUid)) {
    that.emit('guia_error: empty uid');
    return
  }

  that.redisClient.HGETALL('u:' + aUid, function (err, obj) {
    if (!err) {
      if (!_.isEmpty(obj.mt)) {
        obj.mt = JSON.parse(obj.mt);
      }
      if (!_.isEmpty(obj.bp)) {
        obj.bp = JSON.parse(obj.bp);
      }
      if (!_.isEmpty(obj.rights)) {
        obj.rights = JSON.parse(obj.rights);
      }
      that.emit('guia_ok', obj);
    } else {
      that.emit('guia_error', err);
    }
  });
}