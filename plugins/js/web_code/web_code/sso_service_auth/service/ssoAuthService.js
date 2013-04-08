/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-27
 * Time: 上午9:29
 * To change this template use File | Settings | File Templates.
 */
/** log       */
var winston  = require('../lib/winstonLog')
    ,redisLog = winston.redisLog
    ,serviceLog  = winston.servcieLog
/** redis client */
    ,redis = require('redis')
/**  generic-pool     */
    ,poolModule = require('generic-pool')
/** config     */
    ,config = require('../config/config.json')
/** utils      */
    ,util = require('util')
/** underscore     */
    ,_ = require('underscore')
    ,uuid = require('node-uuid')
/** upUtils        */
    ,upUtils = require('../lib/utils').upUtils
/**  monent        */
    ,moment = require('moment')
/**  rabbitmq log*/
    ,rabbitmqLog = require('sso_log_module').SSOLogSendService;


/**  redis  pool   */
var pool = poolModule.Pool({
    name               : 'redis',
    create             : function(callback){
        var redisClient = redis.createClient(config.redis.port, config.redis.host);
        callback(null,redisClient);
    },
    destroy            : function(client){
        if(client.connected) client.quit();
    },
    max                : config.redis.redis_pool.poolMax,
    min                : config.redis.redis_pool.poolMin,
    idleTimeoutMillis  : config.redis.redis_pool.poolTimeOutMillis,   //失效时间 秒
    log                : config.redis.redis_pool.poolLog
});

exports.SSOService = {
    redisPool : pool,
    /**
     * init
     */
    init : function(){
        rabbitmqLog.init();
    },
    /**
     * Draining
     */
    destroyAllNow : function(){
        var _self = this;
        this.redisPool.drain(function(){
            _self.redisPool.destroyAllNow();
        });
    },
    destoryRabbitMQLog : function(){
        rabbitmqLog.destroy();
    },
    /**
     * 通过username 获得用户信息
     * @param id    username
     * @param callback
     */
    getUserInfo : function(username,callback){
        var _self = this;
        this.redisPool.acquire(function(err, client){
            if(err){
                _self.redisPool.release(client);
                process.nextTick(function(){
                    callback({errorCode:5,errorMsg:'ssoAuthService class getUserInfo method generic-pool acquire error : '+err.stack});
                });
            }else{
                var userKey = ['u:',username].join('');
                client.hgetall(userKey, function doHgetAllUserInfo(error,userInfo){
                    _self.redisPool.release(client);
                    if(error) {
                        process.nextTick(function(){
                            callback({errorCode:1,errorMsg:'ssoAuthService class getUserInfo method hgetall '+userKey+' error : '+error.stack});
                        });
                    }else{
                        if(_.isNull(userInfo)){
                            process.nextTick(function(){
                                callback({errorCode:1,errorMsg:'ssoAuthService class getUserInfo method hgetall '+userKey+' is null '});
                            });
                        }else{
                            //整理数据
                            if (!_.isEmpty(userInfo.rights))
                                userInfo.rights = JSON.parse(userInfo.rights);
                            if (!_.isEmpty(userInfo.mt))
                                userInfo.mt = JSON.parse(userInfo.mt);
                            if (!_.isEmpty(userInfo.bp))
                                userInfo.bp = JSON.parse(userInfo.bp);
                            if (!_.isEmpty(userInfo.reg_time))
                                userInfo.reg_time = moment.unix(userInfo.reg_time).format('YYYY-MM-DD');
                            if (!_.isEmpty(userInfo.cer_time))
                                userInfo.cer_time = moment.unix(userInfo.cer_time).format('YYYY-MM-DD');
                            process.nextTick(function(){
                                callback(null, userInfo);
                            });
                        }
                    }
                });
            }
        });
    },
    /**
     * 根据token获得用户信息
     * @param token
     * @param callback
     */
    getTokenInfo :function(token, callback){
        var _self = this;
        var tokenKey = ['tk:' + token].join('');
        this.redisPool.acquire(function(err, client){
            if(!err){
                client.HGETALL(tokenKey, function doGetAllTokenInfo(err, tokenInfo) {
                    _self.redisPool.release(client);
                    if(!err){
                        if (!_.isNull(tokenInfo)) {
                            process.nextTick(function(){
                                callback(null, tokenInfo);
                            });
                        }else{
                            process.nextTick(function(){
                                callback({errorCode:1,errorMsg:'ssoAuthService class getTokenInfo method token '+token+' is null'});
                            });
                        }
                    }else{
                        redisLog.error('unique redis HGETALL error:', {"token" : token, "err" : JSON.stringify(err)});
                        process.nextTick(function(){
                            callback({errorCode:1,errorMsg:'ssoAuthService class getTokenInfo method unique redis HGETALL error:'+err.stack});
                        });
                    }
                });
            }else{
                _self.redisPool.release(client);
                redisLog.error('ssoAuthService class getTokenInfo method generic-pool acquire err :'+err.stack);
                process.nextTick(function(){
                    callback({errorCode:1,errorMsg:'ssoAuthService class getTokenInfo method generic-pool acquire err :'+err.stack});
                });
            }
        });
    },
    /**
     * 管理
     * @param up_params
     * @param callback(err, resObject)
     */
    authManager : function(up_params, callback){
        var cmd = up_params.cmd;

        if(_.isEqual(cmd, 'login'))
            this.login(up_params, callback);
        else if(_.isEqual(cmd, 'unique'))
            this.unique(up_params, callback);
        else if(_.isEqual(cmd, 'logout'))
            this.logout(up_params, callback);
        else if(_.isEqual(cmd, 'tickout'))
            this.tickout(up_params, callback);
        else{
            process.nextTick(function(){
                callback({errorCode:0,errorMsg:'ssoAuthService class authManger method params error : cmd not empty'});
            });
        }
    },
    /**
     * 登陆
     * @param req
     * @param res
     */
    login : function(up_params, callback){

        var paramsObject = up_params;
        var clientId = 'up_server';
        var _self = this;
        /**获得用户提交参数字符串*/
        var originalUrl  =  up_params.originalUrl.replace('/auth.do?','');
        serviceLog.info('user commit params : '+originalUrl);
        var queryStringExecuteCRC = upUtils.subStringToBtyes(originalUrl, originalUrl.lastIndexOf('crc')-1);
        serviceLog.info('user commit params execute CRC : '+queryStringExecuteCRC);

        if(!upUtils.checkCRC(paramsObject.crc, queryStringExecuteCRC)){
            process.nextTick(function(){
                callback({errorCode:5,errorMsg:'ssoAuthService class login method crc error : queryString and crc param not equal'});
            });
        }else{
            this.getUserInfo(paramsObject.id, function doGetUserInfo(err, userInfo){
                if(!err){
                    _self.redisPool.acquire(function(err, client){
                        if(!err){
                            //登陆验证
                            if(!_.isEqual(userInfo.pwd, paramsObject.pwd)){
                                _self.redisPool.release(client);
                                process.nextTick(function(){
                                    callback({errorCode:2,errorMsg:'ssoAuthService class login method user and pwd no equal'});
                                });
                            }
                            //获得需要的返回的client data
                            var objResult = _.pick(userInfo, [
                                'cid', 'ut', 'rights'
                            ]);
                            // 生成新token的uuid
                            var strToken = uuid.v1();
                            var strTokenKey = 'tk:' + strToken;

                            _.extend(objResult, {
                                "token":strToken
                            });

                            var objTokenInfo = {
                                "uid":paramsObject.id,
                                "cid" : userInfo.cid,
                                "campaign_id":paramsObject.campainid,
                                "client_id":clientId
                            };
                            var userKey = ['u:',paramsObject.id].join('');
                            var multi = client.multi();
                            multi.HMSET(strTokenKey, objTokenInfo);
                            // 设置token过期时间
                            multi.EXPIRE(strTokenKey, config.token_expire);

                            var strLastToken = userInfo['tk:' + clientId];  // userinfo中的数据是用户的全部数据.
                            if (!_.isEmpty(strLastToken)) {
                                multi.DEL('tk:' + strLastToken);
                            }
                            // 更新用户的最后登录token
                            multi.HSET(userKey, 'tk:' + clientId, strToken);

                            multi.exec(function (err, replies) {
                                if (!err) {
                                    //发出记录日志事件
                                    var data = _.pick(paramsObject, [
                                        'cpu', 'mac', 'diskid','opt','exemd5','otherinfo'
                                    ]);
                                    _.extend(data, {
                                        "uid":paramsObject.id,
                                        "campaignId":paramsObject.campainid,
                                        "actiontype":0,
                                        "cid" : userInfo.cid,
                                        "token" : strToken,
                                        "time" : moment().format('YYYY-MM-DD HH:mm:ss'),
                                        "isOld" : 1
                                    });
                                    //client.INCR('rps_count');//测试apachebench请求量
                                    _self.redisPool.release(client);
                                    //发出写入日志事件
                                    /*process.nextTick(function(){
                                     upLog.emit("UP_SSO_EVENT_WRITE", data);
                                     });*/
                                    process.nextTick(function(){
                                        callback(null, upUtils.getXMLObj(-1,objResult,paramsObject.id));
                                    });
                                    //由rabbitmq替换直接写入数据库记录日志
                                    process.nextTick(function(){
                                        rabbitmqLog.sendLogMsg(data);
                                    });
                                } else {
                                    _self.redisPool.release(client);
                                    process.nextTick(function(){
                                        callback({errorCode:2,errorMsg:"ssoAuthService class login method multi.exec error : "+err.stack});
                                    });
                                }
                            });
                        }else{
                            _self.redisPool.release(client);
                            process.nextTick(function(){
                                callback({errorCode:5,errorMsg:"ssoAuthService class login method generic-pool acquire error : "+err.stack});
                            });
                        }
                    });
                }else{
                    process.nextTick(function(){
                        callback(err);
                    });
                }
            });
        }
    },
    unique : function(up_params, callback){
        var _self = this;
        var token = up_params.online;
        var paramsObject = up_params;

        this.getTokenInfo(token, function doGetTokenInfo(err, tokenInfo){
            if(!err){
                _self.getUserInfo(tokenInfo.uid,function doGetUserInfoToUnique(err,userInfo){
                    if(!err){
                        _self.redisPool.acquire(function(err, client){
                            if(!err){
                                //获得需要的返回的client data
                                var objResult = _.pick(userInfo, [
                                    'cid', 'ut', 'rights'
                                ]);

                                _.extend(objResult, {
                                    "token":token
                                });
                                // 更新token过期时间.
                                client.EXPIRE('tk:' + token, config.token_expire);//seconds
                                _self.redisPool.release(client);

                                process.nextTick(function(){
                                    callback(null, upUtils.getXMLObj(-1,objResult,paramsObject.id));
                                });
                            }else{
                                _self.redisPool.release(client);
                                redisLog.error("ssoAuthService class unique method generic-pool acquire err :"+err.stack);
                                process.nextTick(function(){
                                    callback({errorCode:1,errorMsg:"ssoAuthService class unique method generic-pool acquire err :"+err.stack});
                                });
                            }
                        });
                    }else{
                        process.nextTick(function(){
                            callback(err);
                        });
                    }
                });
            }else{
                process.nextTick(function(){
                    callback(err);
                });
            }
        });
    },
    /**
     * 踢人接口
     * @param req
     * @param res
     */
    tickout : function(up_params, callback){

        var token = up_params.online;
        var _self = this;

        try{
            if (!_.isEmpty(token) && _.isString(token)) {
                this.getTokenInfo(token, function doGetTokenInfoToLogout(err, tokenInfo){
                    if(!err){
                        _self.redisPool.acquire(function(err, client){
                            if(!err){
                                client.DEL('tk:' + token);
                                _self.redisPool.release(client);
                                //发出记录日志事件
                                var data = _.pick(up_params, [
                                    'cpu', 'mac', 'diskid','opt','exemd5','otherinfo'
                                ]);
                                _.extend(data, {
                                    "uid":up_params.id,
                                    "campaignId":tokenInfo.campaign_id,
                                    "actiontype":2,
                                    "cid" : tokenInfo.cid,
                                    "token" : up_params.online,
                                    "time" : moment().format("YYYY-MM-DD HH:mm:ss"),
                                    "isOld" : 1
                                });
                                //发出写入日志事件
                                /*process.nextTick(function(){
                                 upLog.emit("UP_SSO_EVENT_WRITE", data);
                                 });*/
                                process.nextTick(function(){
                                    callback(null, upUtils.getXMLObj(-2));
                                });
                                //由rabbitmq替换直接写入数据库记录日志
                                process.nextTick(function(){
                                    rabbitmqLog.sendLogMsg(data);
                                });
                            }else{
                                _self.redisPool.release(client);
                                process.nextTick(function(){
                                    callback({errorCode:-2,errorMsg:"ssoAuthService class logout method generic-pool acquire  err : "+err.stack});
                                });
                            }
                        });
                    }else{
                        process.nextTick(function(){
                            callback(err);
                        });
                    }
                });
            } else {
                process.nextTick(function(){
                    callback({errorCode:1,errorMsg:"ssoAuthService class logout method params error : token not empty"});
                });
            }
        }catch(err){
            process.nextTick(function(){
                callback({errorCode:-2,errorMsg:"ssoAuthService class logout method error : "+err.stack});
            });
        }
    },
    /**
     * 推出接口
     * @param req
     * @param res
     */
    logout : function(up_params, callback){
        var token = up_params.online;
        var _self = this;

        try{
            if (!_.isEmpty(token) && _.isString(token)) {
                this.getTokenInfo(token, function doGetTokenInfoToLogout(err, tokenInfo){
                    if(!err){
                        _self.redisPool.acquire(function(err, client){
                            if(!err){
                                client.DEL('tk:' + token);
                                _self.redisPool.release(client);
                                //发出记录日志事件
                                var data = _.pick(up_params, [
                                    'cpu', 'mac', 'diskid','opt','exemd5','otherinfo'
                                ]);
                                _.extend(data, {
                                    "uid":up_params.id,
                                    "campaignId":tokenInfo.campaign_id,
                                    "actiontype":1,
                                    "cid" : tokenInfo.cid,
                                    "token" : up_params.online,
                                    "time" : moment().format("YYYY-MM-DD HH:mm:ss"),
                                    "isOld" : 1
                                });
                                //发出写入日志事件
                                /*process.nextTick(function(){
                                 upLog.emit("UP_SSO_EVENT_WRITE", data);
                                 });*/
                                process.nextTick(function(){
                                    callback(null, upUtils.getXMLObj(-2));
                                });
                                //由rabbitmq替换直接写入数据库记录日志
                                process.nextTick(function(){
                                    rabbitmqLog.sendLogMsg(data);
                                });
                            }else{
                                _self.redisPool.release(client);
                                process.nextTick(function(){
                                    callback({errorCode:-2,errorMsg:"ssoAuthService class logout method generic-pool acquire  err : "+err.stack});
                                });
                            }
                        });
                    }else{
                        process.nextTick(function(){
                            callback(err);
                        });
                    }
                });
            } else {
                process.nextTick(function(){
                    callback({errorCode:1,errorMsg:"ssoAuthService class logout method params error : token not empty"});
                });
            }
        }catch(err){
            process.nextTick(function(){
                callback({errorCode:-2,errorMsg:"ssoAuthService class logout method error : "+err.stack});
            });
        }
    }
}