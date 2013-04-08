/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-31
 * Time: 下午11:32
 * To change this template use File | Settings | File Templates.
 */
/** log       */
var winston  = require("../lib/winstonLog")
    ,redisLog = winston.redisLog
    ,serviceLog  = winston.servcieLog
/** redis client */
    ,redis = require("redis")
/**  generic-pool     */
    ,poolModule = require("generic-pool")
/** config     */
    ,config = require("../config/config.json")
/** utils      */
    ,util = require("util")
/** underscore     */
    ,_ = require("underscore")
    ,uuid = require('node-uuid')
/** upUtils        */
    ,upUtils = require("../lib/utils").upUtils
/**  monent        */
    ,moment = require('moment');
/**  rabbitmq log*/
    //,rabbitmqLog = require('sso_log_module').SSOLogSendService;


/**  redis  pool   */
var pool = poolModule.Pool({
    name               : "redis",
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
        //rabbitmqLog.init();
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
        //rabbitmqLog.destroy();
    },
    /**
     * auth.do 管理function
     *
     * @param req
     * @param res
     */
    authManager : function(req, res){
        if(_.isEqual(req.up_params.cmd, "login"))
            this.login(req, res);
        else if(_.isEqual(req.up_params.cmd, "unique"))
            this.unique(req, res);
        else if(_.isEqual(req.up_params.cmd, "logout"))
            this.logout(req, res);
        else if(_.isEqual(req.up_params.cmd, "tickout"))
            this.tickout(req, res);
    },
    /**
     * 登陆
     * @param req
     * @param res
     */
    login : function(req, res){

        var paramsObject = req.up_params;
        var clientId = "up_server";
        var _self = this;
        /**获得用户提交参数字符串*/
        var originalUrl  =  req.originalUrl.replace("/auth.do?","");
        serviceLog.info("user commit params : "+originalUrl);
        var queryStringExecuteCRC = upUtils.subStringToBtyes(originalUrl, originalUrl.lastIndexOf("crc")-1);
        serviceLog.info("user commit params execute CRC : "+queryStringExecuteCRC);

        if(!upUtils.checkCRC(paramsObject.crc, queryStringExecuteCRC)){
            serviceLog.error("queryString and crc param not equal ");
            _self.returnMsg(res, upUtils.getXMLObj(5));
            return;
        }

        this.redisPool.acquire(function(err, client){
            if(err){
                serviceLog.error("generic-pool acquire GET REDIS CLIENT ERROR :",err);
                _self.redisPool.release(client);
                return;
            }else{
                var multi = client.multi();
                var userKey = ['u:',paramsObject.id].join("");
                client.hgetall(userKey, function(err,obj){
                    if(err) {
                        redisLog.error("login : hgetall "+userKey+" error : ", err);
                        _self.returnMsg(res, upUtils.getXMLObj(1));
                        return;
                    }

                    if(_.isNull(obj)){
                        redisLog.error("login : hgetall "+userKey+" Empty : ");
                        _self.returnMsg(res, upUtils.getXMLObj(1));
                        return;
                    }
                    //整理数据
                    if (!_.isEmpty(obj.rights))
                        obj.rights = JSON.parse(obj.rights);
                    if (!_.isEmpty(obj.mt))
                        obj.mt = JSON.parse(obj.mt);
                    if (!_.isEmpty(obj.bp))
                        obj.bp = JSON.parse(obj.bp);
                    if (!_.isEmpty(obj.reg_time))
                        obj.reg_time = moment.unix(obj.reg_time).format('YYYY-MM-DD');
                    if (!_.isEmpty(obj.cer_time))
                        obj.cer_time = moment.unix(obj.cer_time).format('YYYY-MM-DD');
                    //登陆验证
                    if(!_.isEqual(obj.pwd, paramsObject.pwd)){
                        redisLog.error("login : user and pwd no equal");
                        _self.returnMsg(res, upUtils.getXMLObj(2));
                        return ;
                    }
                    //获得需要的返回的client data
                    var objResult = _.pick(obj, [
                        'cid', 'ut', 'rights'
                    ]);

                    // 生成新token的uuid
                    var strToken = uuid.v1();
                    var strTokenKey = "tk:" + strToken;

                    _.extend(objResult, {
                        "token":strToken
                    });

                    var objTokenInfo = {
                        "uid":paramsObject.id,
                        "cid" : obj.cid,
                        "campaign_id":paramsObject.campainid,
                        "client_id":clientId
                    };

                    multi.HMSET(strTokenKey, objTokenInfo);
                    // 设置token过期时间
                    multi.EXPIRE(strTokenKey, config.token_expire);

                    var strLastToken = obj['tk:' + clientId];  // userinfo中的数据是用户的全部数据.
                    if (!_.isEmpty(strLastToken)) {
                        multi.DEL('tk:' + strLastToken);
                    }
                    // 更新用户的最后登录token
                    multi.HSET(userKey, 'tk:' + clientId, strToken);

                    multi.exec(function (err, replies) {
                        if (!err) {
                            //发出记录日志事件
                            var data = _.pick(req.up_params, [
                                'cpu', 'mac', 'diskid','opt','exemd5','otherinfo'
                            ]);

                            _.extend(data, {
                                "uid":req.up_params.id,
                                "campaignId":req.up_params.campainid,
                                "actiontype":0,
                                "cid" : obj.cid,
                                "token" : strToken,
                                "time" : moment().format("YYYY-MM-DD HH:mm:ss")
                            });
                            //client.INCR('rps_count');//测试apachebench请求量
                            _self.redisPool.release(client);
                            //upLog.emit("UP_SSO_EVENT_WRITE", data);
                            //由rabbitmq替换直接写入数据库记录日志
                            rabbitmqLog.sendLogMsg(data);
                            _self.returnMsg(res, upUtils.getXMLObj(-1,objResult,paramsObject.id));
                            return;
                        } else {
                            redisLog.error('login: multi.exec error', _.extend(obj,{err:err}));
                            _self.returnMsg(res, upUtils.getXMLObj(2));
                            return;
                        }
                    });

                });
            }
        });

    },
    unique : function(req, res){
        var _self = this;
        var token = req.up_params.online;
        var paramsObject = req.up_params;

        this.redisPool.acquire(function(err, client){
            if(err){
                serviceLog.error("generic-pool acquire GET REDIS CLIENT ERROR :",err);
                _self.redisPool.release(client);
                return ;
            }else{
                client.HGETALL('tk:' + token, function (err, tokenInfo) {
                    if (!err) {
                        if (!_.isNull(tokenInfo)) {
                            var userKey = "u:"+tokenInfo.uid;

                            //根据token获得用户信息
                            client.HGETALL(userKey, function(err, userInfo){

                                if(err) {
                                    redisLog.error("unique : hgetall "+userKey+" error : ", err);
                                    _self.returnMsg(res, upUtils.getXMLObj(1));
                                    return;
                                }

                                if(_.isNull(userInfo)){
                                    redisLog.error("unique : hgetall "+userKey+" Empty : ");
                                    _self.returnMsg(res, upUtils.getXMLObj(1));
                                    return;
                                }
                                //console.log(token+"===="+userKey);
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


                                //获得需要的返回的client data
                                var objResult = _.pick(userInfo, [
                                    'cid', 'ut', 'rights'
                                ]);

                                _.extend(objResult, {
                                    "token":token
                                });
                                // 更新token过期时间.
                                client.EXPIRE('tk:' + token, config.token_expire);//seconds
                                //发出记录日志事件？？？？？？？？？？


                                _self.returnMsg(res, upUtils.getXMLObj(-1,objResult,paramsObject.id));

                                _self.redisPool.release(client);
                            });
                        } else {
                            redisLog.error('unique TOKEN_NOT_EXISTS : ',[token,' TOKEN_NOT_EXISTS'].join(""));
                            _self.returnMsg(res, upUtils.getXMLObj(1));
                            return;
                        }
                    } else {
                        redisLog.error('unique redis HGETALL error:', {"token" : token, "err" : JSON.stringify(err)});
                        _self.returnMsg(res, upUtils.getXMLObj(1));
                        return;
                    }
                });
            }
        });
    },
    /**
     * 踢人接口
     * @param req
     * @param res
     */
    tickout : function(req, res){
        var token = req.up_params.online;
        var _self = this;

        try{
            if (!_.isEmpty(token) && _.isString(token)) {
                //删除token
                this.redisPool.acquire(function(err, client){
                    if(err){
                        redisLog.error("generic-pool acquire  err :",err);
                        _self.redisPool.release(client);
                    }else{
                        //从redis中获取数据
                        var tokeyKey = ["tk:",req.up_params.online].join("");
                        client.hgetall(tokeyKey, function(error,tokeyInfo){
                            if(error) {
                                redisLog.error("tickout : hgetall "+tokeyKey+" error : ", error);
                                _self.redisPool.release(client);
                                _self.returnMsg(res, upUtils.getXMLObj(1));
                                return;
                            }

                            if(_.isNull(tokeyInfo)){
                                redisLog.error("tickout : hgetall "+tokeyKey+" is null ");
                                _self.redisPool.release(client);
                                _self.returnMsg(res, upUtils.getXMLObj(1));
                                return;
                            }

                            //发出记录日志事件
                            var data = _.pick(req.up_params, [
                                'cpu', 'mac', 'diskid','opt','exemd5','otherinfo'
                            ]);

                            _.extend(data, {
                                "uid":req.up_params.id,
                                "campaignId":tokeyInfo.campaign_id,
                                "actiontype":2,
                                "cid" : tokeyInfo.cid,
                                "token" : req.up_params.online,
                                "time" : moment().format("YYYY-MM-DD HH:mm:ss")
                            });
                            //upLog.emit("UP_SSO_EVENT_WRITE", data);
                            //由rabbitmq替换直接写入数据库记录日志
                            rabbitmqLog.sendLogMsg(data);

                            client.DEL('tk:' + token);
                            _self.redisPool.release(client);
                            _self.returnMsg(res, upUtils.getXMLObj(-2));
                        });

                    }
                });
            } else {
                serviceLog.error('logout: token empty', token);
                this.returnMsg(res, upUtils.getXMLObj(1));
                return;
            }
        }catch(err){
            serviceLog.error(err);
            this.returnMsg(res, upUtils.getXMLObj(-2));
            return;
        }
    },
    /**
     * 推出接口
     * @param req
     * @param res
     */
    logout : function(req, res){
        var token = req.up_params.online;
        var _self = this;

        try{
            if (!_.isEmpty(token) && _.isString(token)) {
                //删除token
                this.redisPool.acquire(function(err, client){
                    if(err){
                        redisLog.error("generic-pool acquire  err :",err);
                        _self.redisPool.release(client);
                    }else{
                        //从redis中获取数据
                        var tokeyKey = ["tk:",req.up_params.online].join("");
                        client.hgetall(tokeyKey, function(error,tokeyInfo){
                            if(error) {
                                redisLog.error("logout : hgetall "+tokeyKey+" error : ", error);
                                _self.redisPool.release(client);
                                _self.returnMsg(res, upUtils.getXMLObj(1));
                                return;
                            }

                            if(_.isNull(tokeyInfo)){
                                redisLog.error("logout : hgetall "+tokeyKey+" is null ");
                                _self.redisPool.release(client);
                                _self.returnMsg(res, upUtils.getXMLObj(1));
                                return;
                            }

                            //发出记录日志事件
                            var data = _.pick(req.up_params, [
                                'cpu', 'mac', 'diskid','opt','exemd5','otherinfo'
                            ]);

                            _.extend(data, {
                                "uid":req.up_params.id,
                                "campaignId":tokeyInfo.campaign_id,
                                "actiontype":1,
                                "cid" : tokeyInfo.cid,
                                "token" : req.up_params.online,
                                "time" : moment().format("YYYY-MM-DD HH:mm:ss")
                            });
                            //upLog.emit("UP_SSO_EVENT_WRITE", data);
                            //由rabbitmq替换直接写入数据库记录日志
                            rabbitmqLog.sendLogMsg(data);

                            client.DEL('tk:' + token);
                            _self.redisPool.release(client);
                            _self.returnMsg(res, upUtils.getXMLObj(-2));
                        });

                    }
                });
            } else {
                serviceLog.error('logout: token empty', token);
                this.returnMsg(res, upUtils.getXMLObj(1));
                return;
            }
        }catch(err){
            serviceLog.error(err);
            this.returnMsg(res, upUtils.getXMLObj(-2));
            return;
        }
    },
    /**
     * 统一返回数据function
     * @param res
     * @param result
     */
    returnMsg : function(res,result){
        res.send(result);

    }

}


