var util = require('util'),
  qs = require('querystring'),
  express = require('express'),
  app = express(),
  _ = require('underscore'),
  winston = require('winston'),
  SSO_EVENTS = require(__dirname + '/sso_service_controller_events.js').SSO_EVENTS,
  ssoc = require(__dirname + '/sso_service_controller_redis.js'),
  redis_pool = require(__dirname + '/up_pools.js').RedisPool,
  errDict = require(__dirname + '/error_dict.js').ErrorDict,
  us = require('up_security'),
  logger = require(__dirname + '/logger_wrapper.js').getLogger({
    filename:__dirname + '/log/sso_service.log',
    maxsize:10485760,
    maxFiles:5
  });

var middlewareForDebug = function (req, res, next) {
  console.log('req.body: %j', req.body);
  next();
};

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
  app.set('title', 'UPChina SSO Service v1 ');
  app.enable('trust proxy');  // 在nginx反向代理的后端服务器上, 必须加这个才能获得客户端真实ip
});

// 系统中间件配置===============================================
app.use(express.logger()); // 'short', 'tiny', 'dev'
app.use(express.bodyParser());


var fnSendErrResult = function (aErr, aClientId, aRes) {
//    var objResult = {
//      result:false,
//      err_code:aErrEvent,
//      err_msg:errDict[aClientId][aErrEvent]
//    };
  _.extend(aErr, {
    result:false,
    err_msg:errDict[aClientId][aErr.err_code]
  });
  aRes.send(us.generateEncryptedParams(aErr, aClientId));
};

// 心跳 =================================================
app.get('/sso/clientId/:clientId/tk/:token/hb/', mw_preprocess, function (req, res, next) {

  redis_pool.acquire(function (err, client) {
    if (!err) {
      var conn = ssoc.createConnection(client);
      var strClientId = req.param('clientId');

      conn.heartbeat(req.param('token'), req.ip, function (err, aResult) {
        if (err) {
          fnSendErrResult(err, strClientId, res);
          return;
        }
        res.send(us.generateEncryptedParams(aResult, aResult.client_id));
        redis_pool.release(client);
        conn = null;
      });
    }
    else {
      logger.error('heartbeat: redis pool error', err);
    }
  });

});


// 用户名密码登录 =================================================
app.post('/sso/uv/', sso_middlewares, function (req, res, next) {

  if (req.up_params.isDecryptionOK) {
    redis_pool.acquire(function (err, client) {
      if (!err) {
        var conn = ssoc.createConnection(client);

        conn.pwdLogin(req.up_params.decryptedParam, req.up_params.clientId, req.ip, function (err, aResult) {
          if (err) {
            fnSendErrResult(err, req.up_params.clientId, res);
            return;
          }

          res.send(us.generateEncryptedParams(aResult, req.up_params.clientId));
          redis_pool.release(client);
          conn = null;
        });
      }
      else {
        logger.error('login: redis pool error', err);
      }
    });

  }
  else {
    console.dir(req.up_params);
    res.send(us.generateEncryptedParams(req.up_params.errResult, req.up_params.clientId));
  }
});

// token 登录 =================================================
app.get('/sso/clientId/:clientId/tk/:token/info/', mw_preprocess, function (req, res, next) {

  redis_pool.acquire(function (err, client) {
    if (!err) {
      var conn = ssoc.createConnection(client);
      var strClientId = req.param('clientId');

      conn.tokenLogin(req.param('token'), req.ip, function (err, aResult) {
        if (err) {
          fnSendErrResult(err, strClientId, res);
          return;
        }
        res.send(us.generateEncryptedParams(aResult, aResult.client_id));
        redis_pool.release(client);
        conn = null;
      });
    }
    else {
      logger.error('token login: redis pool error', err);
    }
  });

});

// 登录退出 =================================================
app.del('/sso/clientId/:clientId/tk/:token/', mw_preprocess, function (req, res, next) {

  redis_pool.acquire(function (err, client) {
    if (!err) {
      var conn = ssoc.createConnection(client);
      var strClientId = req.param('clientId');

      conn.logout(req.param('token'), function (err, aResult) {
        if (err) {
          fnSendErrResult(err, strClientId, res);
          return;
        }
        res.send(us.generateEncryptedParams({result:true}, strClientId));
        redis_pool.release(client);
        conn = null;
      });
    }
    else {
      logger.error('logout: redis pool error', err);
    }
  });

});

// 404 and errors===============================================
app.use(function (req, res, next) { // 404s
  res.send(404, '404 Not Found\n');
});
app.use(function (err, req, res, next) { // error handler
  logger.error('err handler', err.stack);
  next(err);
});

app.listen(52561);
console.log(app.get('title') + ' started.');

process.on('SIGINT', function () {
//  console.log(
//    "\nShutting down worker %s(%s)...",
//    cluster.worker.id,
//    cluster.worker.process.pid
//  );
  redis_pool.drain(function () {
    redis_pool.destroyAllNow(function () {
      process.exit(0);
    });
  });
});

process.on('uncaughtException', function (err) {
//  var strErr = util.format(
//    'Uncaught Exception on worker: %s(%s) with error: %j',
//    cluster.worker.id,
//    cluster.worker.process.pid,
//    err
//  );
  logger.error(strErr, function (err, level, msg, meta) {
    redis_pool.drain(function () {
      redis_pool.destroyAllNow(function () {
        process.exit(1);
      });
    });
  });
});

process.on('exit', function () {
//  console.log(
//    'Exiting sso service on worker %s(%s)...',
//    cluster.worker.id,
//    cluster.worker.process.pid
//  );
});