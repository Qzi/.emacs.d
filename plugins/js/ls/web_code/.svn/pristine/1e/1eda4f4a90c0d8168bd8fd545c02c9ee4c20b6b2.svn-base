/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-2-4
 * Time: 下午4:39
 * To change this template use File | Settings | File Templates.
 */
var cluster = require('cluster');
var fs = require('fs');
var numCPUs = require('os').cpus().length > 1 ? require('os').cpus().length - 1 : 1;

cluster.setMaxListeners(0);

if (cluster.isWorker) {

  var util = require('util');
  var qs = require('querystring');
  var express = require('express');
  var app = express();
  var _ = require('underscore');
  var winston = require('winston');

  var config = require(__dirname+'/config.json');
  var SSO_EVENTS = require(__dirname + '/sso_service_controller_events.js').SSO_EVENTS;
  var ssoc = require(__dirname + '/sso_service_controller_redis.js');
  var redis_pool = require(__dirname + '/up_pools.js').RedisPool;
  var errDict = require(__dirname + '/error_dict.js').ErrorDict;
  var us = require('up_security');
  var userLog = require('sso_log_module').SSOLogSendService;
  var logger = require(__dirname + '/logger_wrapper.js').getLogger({
      filename:__dirname + '/log/sso_service.log',
      maxsize:10485760,
      maxFiles:5
    });
  var strAddrXmlBase64 = fs.readFileSync(__dirname+'/addr.xml','base64');
  console.log('addr.xml loaded');

  var mw_preprocess = function (req, res, next) {
    res.set({
      'Expires':0,
      'Cache-Control':'no-cache'
    });
    next();
  };

// 中间件数组.
  var sso_middlewares = [mw_preprocess, us.up_decrypt_middleware_for_express];

//环境配置==================================================
  app.configure(function () {
    app.set('title', 'UPChina SSO Service on worker: '+cluster.worker.id);
    app.enable('trust proxy');  // 在nginx反向代理的后端服务器上, 必须加这个才能获得客户端真实ip
    userLog.init();
  });

// 系统中间件配置===============================================
  app.use(express.logger('short')); // 'short', 'tiny', 'dev'
  app.use(express.bodyParser());


  var fnSendErrResult = function (aErr, aClientId, aRes) {
    var objResult =_.extend(aErr, {
      result:false,
      err_msg:errDict[aClientId][aErr.err_code]
    });
    aRes.send(us.generateEncryptedParams(objResult, aClientId));
  };

// 心跳 =================================================
  app.get('/sso/clientId/:clientId/tk/:token/hb/', mw_preprocess, function (req, res, next) {
    var strClientId = req.param('clientId');
    var strToken = req.param('token');
    var isParamValid = !_.isEmpty(strClientId) && !_.isEmpty(strToken);

    if (isParamValid) {
      redis_pool.acquire(function (err, client) {
        if (!err) {
          var conn = ssoc.createConnection(client, userLog);
          conn.heartbeat(strToken, req.ip, function (err, aResult) {
            redis_pool.release(client);
            if (!err) {
              res.send(us.generateEncryptedParams(aResult, aResult.client_id));
            }
            else {
              fnSendErrResult(err, strClientId, res);
            }
          });
        }
        else {
          logger.error('heartbeat: redis pool error', err);
          fnSendErrResult({err_code:SSO_EVENTS.HB.ERR}, strClientId, res);
        }
      });
    }
    else {
      fnSendErrResult({err_code:SSO_EVENTS.COMMON.ERR_PARAMETER_EMPTY}, strClientId, res);
    }
  });

  // 用户名密码登录 =================================================
  app.post('/sso/uv/', sso_middlewares, function (req, res, next) {
    var strClientId = req.up_params.clientId;
    if (req.up_params.isDecryptionOK) {
      redis_pool.acquire(function (err, client) {
        if (!err) {
          var conn = ssoc.createConnection(client, userLog);
          conn.pwdLogin(req.up_params.decryptedParam, strClientId, req.ip, function (err, aResult) {
            redis_pool.release(client);
            if (!err) {
              res.send(us.generateEncryptedParams(aResult, strClientId));
            }
            else {
              fnSendErrResult(err, strClientId, res);
            }
          });
        }
        else {
          logger.error('login: redis pool error', err);
          fnSendErrResult({err_code:SSO_EVENTS.LOGIN.ERR}, strClientId, res);
        }
      });
    }
    else {
      res.send(us.generateEncryptedParams(req.up_params.errResult, strClientId));
    }
  });

  // 用户名密码登录 测试版 =================================================
  app.post('/sso/uvtest/|/sso/uv2/', sso_middlewares, function (req, res, next) {
    var strClientId = req.up_params.clientId;
    if (req.up_params.isDecryptionOK) {
      redis_pool.acquire(function (err, client) {
        if (!err) {
          var conn = ssoc.createConnection(client, userLog);
          conn.pwdLogin(req.up_params.decryptedParam, strClientId, req.ip, function (err, aResult) {
            redis_pool.release(client);
            if (!err) {
              _.extend(aResult, {'addr':strAddrXmlBase64});
              res.send(us.generateEncryptedParams(aResult, strClientId));
            }
            else {
              fnSendErrResult(err, strClientId, res);
            }
          });
        }
        else {
          logger.error('login: redis pool error', err);
          fnSendErrResult({err_code:SSO_EVENTS.LOGIN.ERR}, strClientId, res);
        }
      });
    }
    else {
      res.send(us.generateEncryptedParams(req.up_params.errResult, strClientId));
    }
  });

// token 登录 =================================================
  app.get('/sso/clientId/:clientId/tk/:token/info/', mw_preprocess, function (req, res, next) {
    var strClientId = req.param('clientId');
    var strToken = req.param('token');
    var isParamValid = !_.isEmpty(strClientId) && !_.isEmpty(strToken);
    if (isParamValid) {
      redis_pool.acquire(function (err, client) {
        if (!err) {
          var conn = ssoc.createConnection(client, userLog);
          conn.tokenLogin(strToken, req.ip, function (err, aResult) {
            redis_pool.release(client);
            if (!err) {
              res.send(us.generateEncryptedParams(aResult, aResult.client_id));
            }
            else {
              fnSendErrResult(err, strClientId, res);
            }
          });
        }
        else {
          logger.error('token login: redis pool error', err);
          fnSendErrResult({err_code:SSO_EVENTS.TOKEN_LOGIN.ERR}, strClientId, res);
        }
      });
    }
    else {
      fnSendErrResult({err_code:SSO_EVENTS.COMMON.ERR_PARAMETER_EMPTY}, strClientId, res);
    }
  });

// 登录退出 =================================================
  app.del('/sso/clientId/:clientId/tk/:token/', mw_preprocess, function (req, res, next) {
    var strClientId = req.param('clientId');
    var strToken = req.param('token');
    var isParamValid = !_.isEmpty(strClientId) && !_.isEmpty(strToken);

    if (isParamValid) {
      redis_pool.acquire(function (err, client) {
        if (!err) {
          var conn = ssoc.createConnection(client, userLog);
          conn.logout(strToken, function (err) {
            redis_pool.release(client);
            if (!err) {
              res.send(us.generateEncryptedParams({result:true}, strClientId));
            }
            else {
              fnSendErrResult(err, strClientId, res);
            }
          });
        }
        else {
          logger.error('logout: redis pool error', err);
        }
      });
    }
    else {
      fnSendErrResult({err_code:SSO_EVENTS.COMMON.ERR_PARAMETER_EMPTY}, strClientId, res);
    }
  });

// 404 and errors===============================================
  app.use(function (req, res, next) { // 404s
    res.send(404, '404');
  });
  app.use(function (err, req, res, next) { // error handler
    logger.error('err handler', err.stack);
    next(err);
  });

  app.listen(config.port);

  console.log('%s started on port %d', app.get('title'), config.port);

  process.on('SIGINT', function () {
    if (_.isUndefined(cluster.worker.suicide) || !cluster.worker.suicide ) {
      console.log('SIGINT: cluster.worker.disconnect();');
      cluster.worker.disconnect();
    }
    console.log(
      "\nShutting down worker %s(%s)...",
      cluster.worker.id,
      cluster.worker.process.pid
    );
    redis_pool.drain(function () {
      redis_pool.destroyAllNow(function () {
        process.exit(0);
      });
    });
  });

  process.on('uncaughtException', function (err) {
    if (_.isUndefined(cluster.worker.suicide) || !cluster.worker.suicide ) {
      console.log('uncaughtException: cluster.worker.disconnect();');
      cluster.worker.disconnect();
    }
    var strErr = util.format(
      'Uncaught Exception on worker: %s(%s) with error: %j',
      cluster.worker.id,
      cluster.worker.process.pid,
      err
    );
    logger.error(strErr, function (err, level, msg, meta) {
      redis_pool.drain(function () {
        redis_pool.destroyAllNow(function () {
          process.exit(1);
        });
      });
    });
  });

  process.on('exit', function () {
    console.log(
      'Exiting sso service on worker %s(%s)...',
      cluster.worker.id,
      cluster.worker.process.pid
    );
  });

}
else if (cluster.isMaster) {
  console.log('Use %d CPU(s) on Server', numCPUs);
  cluster.setupMaster({
    silent:false
  });

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', function (aWorker) {
    console.log('The worker %s(%s) has disconnected', aWorker.id, aWorker.process.pid);
  });

  cluster.on('exit', function (aWorker, code, signal) {
    if (code != 0) {
      cluster.fork();
      console.log("worker %s(%s) exited with error code: %s ", aWorker.id, aWorker.process.pid, code);
    }
    else {
      console.log("worker %s(%s) exit succeed!", aWorker.id, aWorker.process.pid);
    }

//    if (aWorker.suicide) {
//      console.log('worker %s(%s) suicide, exit succeed!', aWorker.id, aWorker.process.pid);
//    }
//    else {
//    if (signal) {
//      console.log("worker %s(%s) was killed by signal: %s ", aWorker.id, aWorker.process.pid, signal);
//    }

  });

  process.on('SIGINT', function () {
    console.log("\nShutting down...");
    cluster.disconnect(function(){
      process.nextTick(function () {
        process.exit(0);
      });
    });
  });

  process.on('uncaughtException', function (err) {
    cluster.disconnect(function(){
      process.nextTick(function () {
        process.exit(1);
      });
    });
  })

  process.on('exit', function () {
    console.log('Exiting sso with cluster service...');
  });

}