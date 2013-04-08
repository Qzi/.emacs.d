/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-18
 * Time: 下午2:42
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');
var events = require('events');
//var fs = require('fs');
//var redis = require('redis');
var _ = require('underscore');
var uuid = require('node-uuid');
var moment = require('moment');
var config = require(__dirname + '/config.json');
var SSO_EVENTS = require(__dirname + '/sso_service_controller_events.js').SSO_EVENTS;
var innerUserChecker = require(__dirname + '/inner-user-checker.js');
var logger = require(__dirname + '/logger_wrapper.js').getLogger({
  filename:__dirname + '/log/sso_service_controller.log',
  maxsize:10485760,
  maxFiles:5
});

exports.createConnection = function (aRedisConn, aLogServ) {
  var objConn = new SSOServiceControllerRedis(aRedisConn, aLogServ);
  return objConn;
};

function SSOServiceControllerRedis(aRedisConn, aLogServ) {
  this.redisClient = aRedisConn;
  this.userLog = aLogServ;
}

/*
 * # 功能: 用户名+密码登录
 * # 逻辑:
 *   - 密码正确
 *     - 特殊用户判断逻辑
 *     - 生成token
 *     - 给token设置过期时间,为config中的token_expire时长
 *     - 记录用户登录日志
 *   - 密码错误
 *     - 提示各种错误.
 * # 特殊逻辑:
 *   - 互踢机制
 *     - 每次用户名+密码的登陆,会重新生成token, 旧token会被删除
 *   - 内部用户
 *     - 不会互踢: 即登录后,不会删除原先的token,
 *       内部用户只在登出和过期时删除token
 *     - 多个内部用户账号拥有各自的token
 *     - 内部账户需要判断ip地址, 未经许可的ip地址不允许登录.
 * */
SSOServiceControllerRedis.prototype.pwdLogin = function (aLoginData, aClientId, aIP, aCallback) {
  if (!_.isFunction(aCallback)) return;

  var isParamValid = !_.isEmpty(aLoginData) && !_.isEmpty(aClientId);
  if (!isParamValid) {
    aCallback({err_code:SSO_EVENTS.LOGIN.ERR_INPUT_EMPTY});
    return;
  }
  isParamValid = !_.isEmpty(aLoginData.uid) && !_.isEmpty(aLoginData.pwd);
  if (!isParamValid) {
    logger.error('login_error: uid or pwd is empty', aLoginData);
    aCallback({err_code:SSO_EVENTS.LOGIN.ERR_UID_PWD_EMPTY});
    return;
  }

  var that = this;
  var rc = that.redisClient;
  var multi = rc.multi();

  // 如果没有campaign_id, 则默认为0
  if (!_.has(aLoginData, 'campaign_id')) {
    _.extend(aLoginData, {'campaign_id':'0'})
  }

  // 是否是内部用户帐号
  var bIsInnerUser = innerUserChecker.isUpInnerUser(aLoginData.uid);
  // 内部帐号IP地址访问限制检查.
  if (bIsInnerUser) {
    if (!innerUserChecker.isUpInnerUserIPValid(aLoginData.uid, aIP)) {
      logger.warn('login_error_inneruser_ip_not_allow', _.extend(aLoginData, {'ip':aIP}));
      aCallback({err_code:SSO_EVENTS.COMMON.ERR_IU_IP_NOT_ALLOW});
      return;
    }
  }

  that.getUserInfo(aLoginData.uid, function (err, aUserInfo) {
    if (err) {
      aCallback(err);
      return;
    }

    var strPwd = aLoginData.pwd.toLowerCase();
    aUserInfo.pwd = aUserInfo.pwd.toLowerCase();

    // 密码检查
    if (!_.isEqual(strPwd, aUserInfo.pwd)) {
      logger.warn('login failed: wrong pwd', aLoginData);
      aCallback({err_code:SSO_EVENTS.LOGIN.ERR_WRONG_PWD});
      return;
    }

    // 生成新token的uuid
    var strToken = uuid.v1();
    var strTokenKey = 'tk:' + strToken;

    // 记录客户端用户登录日志
    var logData = {
      uid:aLoginData.uid,
      campaignId:aLoginData.campaign_id,
      actiontype:0,
      cid:aUserInfo.cid,
      token:strToken,
      time:moment().format("YYYY-MM-DD HH:mm:ss")
    };
    _.extend(logData, aLoginData.client_info);
    process.nextTick(function () {
      that.userLog.sendLogMsg(logData);
    });

    // 生成返回给客户端的json数据 ======================================
    // 从读取到的aUserInfo中提取所需字段.
    var objResult = _.pick(aUserInfo, ['cid', 'ut', 'cer_time', 'reg_time', 'rights', 'mt', 'bp']);
    // 给objResult增加必要的字段.
    _.extend(objResult, {
      'result':'true',
      'check_hb':config.check_heartbeat,
      'token':strToken,
      'client_id':aClientId
    });

    // redis中相关token数据的设置  ======================================
    // 添加token信息到redis
    var objTokenInfo = {
      'uid':aLoginData.uid,
      'cid':aUserInfo.cid,
      'campaign_id':aLoginData.campaign_id,
      'client_id':aClientId
    };
    multi.HMSET(strTokenKey, objTokenInfo);
    multi.EXPIRE(strTokenKey, config.token_expire); // 设置token过期时间

    // 非内部用户的处理 ======================================
    // 读取上一次最后登录的token, 并删除.(非内部用户)
    // 对于同一个内部用户,可以存在多个token信息保持同时登录.
    if (!bIsInnerUser) {
      var strLastToken = aUserInfo['tk:' + aClientId];  // 取aUserInfo中的最近一次登录的token
      var strLastTokenKey = 'tk:' + strLastToken;

      if (!_.isEmpty(strLastToken)) {
        try {
          rc.EXISTS(strLastTokenKey, function (err, reply) {
            if (err) {
              logger.error('pwdLogin: rc.EXISTS error', _.extend(aLoginData, {'err':err}));
              aCallback({err_code:SSO_EVENTS.LOGIN.ERR});
              return;
            }

            if (reply === 1) { // 表示有帐户正在登录中.
              // 删掉,踢人动作.
              rc.DEL(strLastTokenKey);
              // 记录踢人日志.
              var logData = {
                uid:aLoginData.uid,
                campaignId:aLoginData.campaign_id,
                actiontype:2,
                cid:aUserInfo.cid,
                token:strLastToken,
                time:moment().format("YYYY-MM-DD HH:mm:ss")
              };
              _.extend(logData, aLoginData.client_info);
              process.nextTick(function () {
                that.userLog.sendLogMsg(logData);
              });
            }
          });
        }
        catch (e) {
          logger.error('pwdLogin: rc.EXISTS exception.', e);
          aCallback({err_code:SSO_EVENTS.LOGIN.ERR});
          return;
        }
      }
      // 更新用户的最后登录token
      multi.HSET('u:' + aLoginData.uid, 'tk:' + aClientId, strToken);
    }

    try {
      multi.EXEC(function (err) {
        if (err) {
          logger.error('pwdLogin: multi.exec error', _.extend(aLoginData, {'err':err}));
          multi.DISCARD();
          aCallback({err_code:SSO_EVENTS.LOGIN.ERR});
          return;
        }
        aCallback(null, objResult);
      });
    } catch (e) {
      logger.error('pwdLogin: multi.EXEC exception', e);
      aCallback({err_code:SSO_EVENTS.LOGIN.ERR});
    }
  });
};


/*
 * 功能: 退出登录
 * 逻辑:
 *   - 记录退出日志.
 *   - 删除token.
 * 输入参数:
 *   - aToken: token
 * 生成事件:
 *   - 参考: sso_service_controller_events.js
 * */
SSOServiceControllerRedis.prototype.logout = function (aToken, aCallback) {
  if (!_.isFunction(aCallback)) return;
  var isParamValid = !_.isEmpty(aToken) && _.isString(aToken);
  if (!isParamValid) {
    aCallback({err_code:SSO_EVENTS.LOGOUT.ERR_TOKEN_EMPTY});
    return;
  }

  var that = this;
  that.getTokenInfo(aToken, function (err, aTokenInfo) {
    if (err) {
      aCallback(err);
      return;
    }

    // 记录客户端用户注销日志
    var logData = {
      uid:aTokenInfo.uid,
      campaignId:aTokenInfo.campaign_id,
      actiontype:1,
      cid:aTokenInfo.cid,
      token:aToken,
      time:moment().format("YYYY-MM-DD HH:mm:ss")
    };
    process.nextTick(function () {
      that.userLog.sendLogMsg(logData);
    });

    try {
      that.redisClient.DEL('tk:' + aToken);
      aCallback(null);
    } catch (e) {
      logger.error('logout: this.redisClient.DEL error', e);
      aCallback({err_code:SSO_EVENTS.LOGOUT.ERR});
    }
  });
};

/*
 * 功能: 心跳
 * 逻辑:
 *   - 首先进行token登录
 *   - 成功后扩展其他必要的属性
 * 输入参数:
 *   - aToken: token
 *   - aIP: 客户端ip地址, 用于判断内部用户是否允许登录
 * 生成事件:
 *   - 参考: sso_service_controller_events.js
 * */
SSOServiceControllerRedis.prototype.heartbeat = function (aToken, aIP, aCallback) {
  if (!_.isFunction(aCallback)) return;
  var isParamValid = !_.isEmpty(aToken) && _.isString(aToken);
  if (!isParamValid) {
    logger.error('heartbeat: aToken is empty or not string', aToken);
    aCallback({err_code:SSO_EVENTS.HB.ERR_INPUT_TOKEN_EMPTY});
    return;
  }

  var that = this;
  that.getTokenInfo(aToken, function (err, aTokenInfo) {
    if (err) {
      aCallback(err);
      return;
    }

    // 内部用户相关判断处理逻辑, 只有IP允许的内部用户才能放行.
    var bIsInnerUser = innerUserChecker.isUpInnerUser(aTokenInfo.uid);
    if (bIsInnerUser) {
      if (!innerUserChecker.isUpInnerUserIPValid(aTokenInfo.uid, aIP)) {
        var objLogData = {
          'uid':aTokenInfo.uid,
          'ip':aIP,
          'token':aToken
        };
        logger.warn('heartbeat error inneruser ip not allow', objLogData);
        aCallback({err_code:SSO_EVENTS.COMMON.ERR_IU_IP_NOT_ALLOW});
        return;
      }
    }

    that.getUserInfo(aTokenInfo.uid, function (err, aUserInfo) {
      if (err) {
        aCallback(err);
        return;
      }

      // 需要从aUserInfo中提取的字段
      var arrFieldsToPick = ['cid', 'ut', 'cer_time', 'reg_time', 'rights', 'mt', 'bp'];
      // 从aUserInfo中提取需要返回的字段
      var objResultHB = _.pick(aUserInfo, arrFieldsToPick);
      // 扩充几个特定的字段.
      _.extend(objResultHB, {
        'result':true,
        'check_hb':config.check_heartbeat,
        'client_id':aTokenInfo.client_id
      });

      try {
        // 更新token过期时间.
        that.redisClient.EXPIRE('tk:' + aToken, config.token_expire, function(err){
          if (err) {
            logger.error('heartbeat that.redisClient.EXPIRE error:', {'uid':aTokenInfo.uid, 'err':JSON.stringify(err)});
            aCallback({err_code:SSO_EVENTS.HB.ERR});
            return;
          }

          aCallback(null, objResultHB);
        });

      } catch (e) {
        logger.error('heartbeat that.redisClient.EXPIRE exception:', {'uid':aTokenInfo.uid, 'err':JSON.stringify(e)});
        aCallback({err_code:SSO_EVENTS.HB.ERR});
      }
    });
  });
};


/*
 * 功能: 使用token登录
 * 逻辑:
 *   - 先根据token读取token信息.
 *   - 再根据token信息中的uid,读取用户信息.
 * 输入参数:
 *   - aToken: token
 *   - aIP: 客户端ip地址, 用于判断内部用户是否允许登录
 * 生成aCallback事件:
 *   - 参考: sso_service_controller_events.js
 * */
SSOServiceControllerRedis.prototype.tokenLogin = function (aToken, aIP, aCallback) {
  if (!_.isFunction(aCallback)) return;
  var isParamValid = !_.isEmpty(aToken) && _.isString(aToken);
  if (!isParamValid) {
    aCallback({err_code:SSO_EVENTS.TOKEN_LOGIN.ERR_INPUT_TOKEN_EMPTY});
    return;
  }

  var that = this;
  that.getTokenInfo(aToken, function (err, aTokenInfo) {
    if (err) {
      aCallback(err);
      return;
    }

    // 内部用户检查, 如果是内部用户并且ip地址正确,则可以继续访问,否则报错.
    var bIsInnerUser = innerUserChecker.isUpInnerUser(aTokenInfo.uid);
    if (bIsInnerUser) {
      if (!innerUserChecker.isUpInnerUserIPValid(aTokenInfo.uid, aIP)) {
        var objLogData = {
          'uid':aTokenInfo.uid,
          'ip':aIP,
          'token':aToken
        };
        logger.warn('tokenLogin error: inner user ip not allow', objLogData);
        aCallback({err_code:SSO_EVENTS.COMMON.ERR_IU_IP_NOT_ALLOW});
        return;
      }
    }

    that.getUserInfo(aTokenInfo.uid, function (err, aUserInfo) {
      if (err) {
        aCallback(err);
        return;
      }

      // 从用户信息中提取所需的字段.
      var objResult = _.pick(aUserInfo, ['cid', 'reg_time', 'ut', 'cer_time', 'rights', 'mt', 'bp']);
      // 增加几个字段和值.
      _.extend(objResult, {
        'result':'true',
        'uid':aTokenInfo.uid,
        'campaign_id':aTokenInfo.campaign_id,
        'client_id':aTokenInfo.client_id
      });

      try {
        // 刷新token过期时间
        that.redisClient.EXPIRE('tk:' + aToken, config.token_expire, function(err){
          if (err) {
            logger.error('tokenLogin that.redisClient.EXPIRE error:', {'uid':aTokenInfo.uid, 'err':JSON.stringify(err)});
            aCallback({err_code:SSO_EVENTS.TOKEN_LOGIN.ERR});
            return;
          }
          aCallback(null, objResult);
        });
      } catch (e) {
        logger.error('tokenLogin that.redisClient.EXPIRE exception:', {'uid':aTokenInfo.uid, 'err':JSON.stringify(e)});
        aCallback({err_code:SSO_EVENTS.TOKEN_LOGIN.ERR});
      }
    });
  });
};

/*
 * 功能: 根据uid获取用户的所有信息,对应redis key: u:<uid>
 * 逻辑: 同功能
 * 输入参数:
 *   - aUID: uid
 * 生成事件:
 *   - 参考: sso_service_controller_events.js
 * */
SSOServiceControllerRedis.prototype.getUserInfo = function (aUID, aCallback) {
  if (!_.isFunction(aCallback)) return;

  var isParamValid = !_.isEmpty(aUID) && _.isString(aUID);
  if (!isParamValid) {
    aCallback({err_code:SSO_EVENTS.GET_USER_INFO.ERR_INPUT_UID_EMPTY});
    return;
  }

  var that = this;
  try {
    that.redisClient.HGETALL('u:' + aUID, function (err, aUserInfo) {
      if (err) {
        logger.error('getUserInfo redis HGETALL error:', {'uid':aUID, 'err':JSON.stringify(err)});
        aCallback({err_code:SSO_EVENTS.GET_USER_INFO.ERR});
        return;
      }

      if (_.isNull(aUserInfo)) {
        aCallback({err_code:SSO_EVENTS.GET_USER_INFO.ERR_UID_NOT_EXISTS});
        return;
      }

      if (_.isUndefined(aUserInfo.pwd)) {
        aUserInfo.pwd = '';
        logger.error('getUserInfo error, empty pwd from db, user: ' + aUserInfo.uid);
      }
      if (!_.isEmpty(aUserInfo.rights))
        aUserInfo.rights = JSON.parse(aUserInfo.rights);
      if (!_.isEmpty(aUserInfo.mt))
        aUserInfo.mt = JSON.parse(aUserInfo.mt);
      if (!_.isEmpty(aUserInfo.bp))
        aUserInfo.bp = JSON.parse(aUserInfo.bp);
      if (!_.isEmpty(aUserInfo.reg_time))
        aUserInfo.reg_time = moment.unix(aUserInfo.reg_time).format('YYYY-MM-DD');
      if (!_.isEmpty(aUserInfo.cer_time))
        aUserInfo.cer_time = moment.unix(aUserInfo.cer_time).format('YYYY-MM-DD');

      aCallback(null, aUserInfo);
    });
  } catch (e) {
    logger.error('getUserInfo redis HGETALL exception:', {'uid':aUID, 'err':JSON.stringify(e)});
    aCallback({err_code:SSO_EVENTS.GET_USER_INFO.ERR});
  }
};


/*
 * 功能: 根据token获取token相关信息
 * 逻辑: 同功能
 * 输入参数:
 *   - aToken: token
 *   - aCallback: function(err, result)
 * 生成事件:
 *   - 参考: sso_service_controller_events.js
 * */
SSOServiceControllerRedis.prototype.getTokenInfo = function (aToken, aCallback) {
  if (!_.isFunction(aCallback)) return;
  var isParamValid = !_.isEmpty(aToken) && _.isString(aToken);
  if (!isParamValid) {
    process.nextTick(function () {
      aCallback({err_code:SSO_EVENTS.GET_TOKEN_INFO.ERR_INPUT_TOKEN_EMPTY});
    });
    return;
  }

  var that = this;
  try {
    that.redisClient.HGETALL('tk:' + aToken, function (err, aTokenInfo) {
      if (err) {
        logger.error('getTokenInfo redis HGETALL error:', {'token':aToken, 'err':JSON.stringify(err)});
        process.nextTick(function () {
          aCallback({err_code:SSO_EVENTS.GET_TOKEN_INFO.ERR});
        });
        return;
      }

      if (_.isNull(aTokenInfo)) {
        process.nextTick(function () {
          aCallback({err_code:SSO_EVENTS.GET_TOKEN_INFO.ERR_TOKEN_NOT_EXISTS});
        });
        return;
      }

      process.nextTick(function () {
        aCallback(null, aTokenInfo);
      });
    });
  } catch (e) {
    logger.error('getTokenInfo redis HGETALL exception:', {'token':aToken, 'err':JSON.stringify(e)});
    process.nextTick(function () {
      aCallback({err_code:SSO_EVENTS.GET_TOKEN_INFO.ERR});
    });
  }
};