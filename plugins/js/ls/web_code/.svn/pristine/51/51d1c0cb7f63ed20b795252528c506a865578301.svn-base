/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 12-12-13
 * Time: 下午4:34
 * To change this template use File | Settings | File Templates.
 */
var util = require('util'),
  express = require('express'),
  app = express(),
  _ = require('underscore'),
  winston = require('winston'),
  ssodm = require('./sso_data_manager_redis.js'),
  up_security = require('up_security'),
  error_dict = require('./error_dict.json');

var logger = new (winston.Logger)({
  transports:[
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename:'./log/sso_data_sync_service.log',
      maxsize:10485760,
      maxFiles:5
    })
  ]
});

// 数据预处理中间件===============================================
var up_params_preprocess = function (req, res, next) {
  if (_.isEmpty(req.body)) {
    res.send({
      "result":false,
      "err_code":error_dict.empty_request_body.err_code,
      "err_msg":error_dict.empty_request_body.err_msg
    });
    logger.error('up_params_preprocess error: req.body is empty');
    return;
  }
  req.up_params = _.clone(req.body);
  next();
};

var up_params_afterprocess = function (req, res, next) {
  if (!req.up_params.isDecryptionOK) {
    res.send(req.up_params.errResult);
    return;
  }
//  console.dir(req.up_params.decryptedParam);
  next();
};

// 中间件数组.
var sso_middlewares = [
  up_params_preprocess,
  up_security.up_decrypt_middleware_for_express,
  up_params_afterprocess
];

var conn = ssodm.createConnection();
conn.on('ready', function () {
  // 环境参数配置==================================================
  app.configure(function () {
    app.set('title', 'UPChina SSO Data Sync Service ver 1.0');
    app.enable('trust proxy');
  });

  // 系统中间件配置===============================================
//  express.logger.token('real_ip', function(req, res){ return req.ip; })
//  app.use(express.logger(':real_ip - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
  app.use(express.logger()); // 'short', 'tiny', 'dev'
  app.use(express.bodyParser());

  // 新增用户===============================================
  app.post('/ssodb/users/', sso_middlewares, function (req, res, next) {
    conn.addNewUsers(req.up_params.decryptedParam, function(err){
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 更新用户基本信息===============================================
  app.post('/ssodb/users_update/', sso_middlewares, function (req, res, next) {
    conn.updateUsers(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 更新用户权限信息===============================================
  app.post('/ssodb/rights/', sso_middlewares, function (req, res, next) {
    conn.updateRights(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 删除用户权限信息===============================================
  app.post('/ssodb/rights_trash/', sso_middlewares, function (req, res, next) {
    conn.deleteRights(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 更新用户会员类型===============================================
  app.post('/ssodb/mt/', sso_middlewares, function (req, res, next) {
    conn.updateMemberTypes(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 删除用户会员类型===============================================
  app.post('/ssodb/mt_trash/', sso_middlewares, function (req, res, next) {
    conn.deleteMemberTypes(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 更新积分信息===============================================
  app.post('/ssodb/bp/', sso_middlewares, function (req, res, next) {
    conn.updateBonusPoint(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  // 更新字典信息.===============================================
  app.post('/ssodb/dict/', sso_middlewares, function (req, res, next) {
    conn.syncDict(req.up_params.decryptedParam, function (err) {
      if (err) {
        var objResult = _.extend(err, {result:false});
        res.send(objResult);
        return;
      }
      res.send({"result":true});
    });
  });

  app.get('/ssodb/uid/:uid', function (req, res, next) {
    res.type('application/json');
    conn.once('guia_ok',function(user_info){
      res.send(user_info);
    });
    conn.once('guia_error',function(err){
      res.send(err);
    });
    conn.getUserInfoAll(req.param('uid'));
  });

  // 404 and errors===============================================
  app.use(function (req, res, next) { // 404s
    res.send(404, '404 Not Found');
  });
  app.use(function (err, req, res, next) { // error handler
    logger.error('err handler', err.stack);
    next(err);
  });

  app.listen(52560);
  logger.info(app.get('title') + ' Started.');

});

var exitCode = 0;

conn.on('end', function () {
  logger.info('Redis connection closed')
  process.exit(exitCode);
});

process.on('SIGINT', function () {
  logger.info("\nshutting down...");
  exitCode = 0;
  conn.closeManager();
});

process.on('uncaughtException', function (err) {
  logger.info('Uncaught Exception:' + JSON.stringify(err), err, function (err, level, msg, meta) {
    exitCode = 1;
    conn.closeManager();
  });
});

process.on('exit', function () {
  logger.info('exiting ' + app.get('title') + '...');
});