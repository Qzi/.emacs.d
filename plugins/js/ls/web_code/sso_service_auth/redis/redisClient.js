/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-25
 * Time: 上午5:57
 * To change this template use File | Settings | File Templates.
 */
/** log       */
var winston  = require("../lib/winstonLog")
    ,redisLog = winston.redisLog

/** redis client */
    ,redis = require("redis")

/** config     */
    ,config = require("../config/config.json")

/** node event */
    ,events = require("events")
/** utils      */
    ,util = require("util")
/** underscore     */
    ,_ = require("underscore")
    ,uuid = require('node-uuid')
/** upUtils        */
    ,upUtils = require("../lib/utils").upUtils
    moment = require('moment');

/**
 * factory
 *
 * @return {RedisClientManager}
 */
exports.createMangerFactory = function(){
    return new RedisClientManager();
}

/**
 * redis client
 *
 * @constructor
 */
function RedisClientManager(){

    events.EventEmitter.call(this);

    var _self = this;
    this._log = redisLog;//redis server
    this.redisClient = redis.createClient(config.redis.port, config.redis.host);

    /**
     * ready events
     */
    this.redisClient.once("ready", function(){
        redisLog.info("redis server is ready!");
        _self.emit("ready");//发出ready事件
    });
    /**
     * connect event
     */
    this.redisClient.once("connect", function(){
        redisLog.info("redis server is connected! port : "+config.redis.port+"; host : "+config.redis.host);
    });

    /**
     * error events
     */
    this.redisClient.on("error", function(err){
        redisLog.error("redis error : "+err);
        //_self.emit("error", err);//发出error事件
    });

    /**
     * idle events
     */
    this.redisClient.on("idle", function(){
        redisLog.info("redis server idle !");
    });

    /**
     * end event
     */
    this.redisClient.once("end", function(){
        redisLog.info("connection has colsed! exit process");
        _self.emit("end");//发出end事件
    });
}
/**继承事件发射器   */
util.inherits(RedisClientManager, events.EventEmitter);

/**
 * close
 */
RedisClientManager.prototype.closeRedisClient =function(){
    if(this.redisClient.connected)
        this.redisClient.quit();
}

/**
 * auth manager
 */
RedisClientManager.prototype.authManager=function(req, res){
    if(_.isEqual(req.up_params.cmd, "login"))
        this.login(req, res);
    else if(_.isEqual(req.up_params.cmd, "unique"))
        this.unique(req, res);
    else if(_.isEqual(req.up_params.cmd, "logout"))
        this.logout(req, res);
    else if(_.isEqual(req.up_params.cmd, "tickout"))
        this.tickout(req, res);
}

/**
 * all response
 */
RedisClientManager.prototype.returnMsg=function(res,result){
    res.send(result);
    return ;
}

/**
 * 登陆
 * @param paramsObject
 */
RedisClientManager.prototype.login = function(req, res){

    var paramsObject = req.up_params;
    var clientId = "up_server";
    var _self = this;
    /**获得用户提交参数字符串*/
    var originalUrl  =  req.originalUrl.replace("/auth.do?","");
    redisLog.info("user commit params : "+originalUrl);
    var queryStringExecuteCRC = upUtils.subStringToBtyes(originalUrl, originalUrl.lastIndexOf("crc")-1);
    redisLog.info("user commit params execute CRC : "+queryStringExecuteCRC);

    if(!upUtils.checkCRC(paramsObject.crc, queryStringExecuteCRC)){
        redisLog.error("queryString and crc param not equal ");
        _self.returnMsg(res, upUtils.getXMLObj(5));
    }

    var multi = this.redisClient.multi();
    var userKey = ['u:',paramsObject.id].join("");
    this.redisClient.hgetall(userKey, function(err,obj){
        /**==============test  */
        obj={
            cid : "60004",
            pwd : "5f900445da139983d9fb030819948540",
            reg_time : "1359353418.873",
            ut : "1",
            cer_time : "0",
            rights:'[{"mid" : "1","end_date" : "2012-12-13"},{"mid" : "2","end_date" : "2012-12-13"}]',
            mt : "",
            bp :""
        };
        /**==============test  */
        if(err) {
            redisLog.error("login : hgetall "+userKey+" error : ", err);
            _self.returnMsg(res, upUtils.getXMLObj(1));
        }

        if(_.isNull(obj)){
            redisLog.error("login : hgetall "+userKey+" Empty : ");
            _self.returnMsg(res, upUtils.getXMLObj(1));
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
                _self.returnMsg(res, upUtils.getXMLObj(-1,objResult,paramsObject.id));
                //发出记录日志事件？？？？？？？？？？

            } else {
                redisLog.error('login: multi.exec error', _.extend(obj,{err:err}));
                _self.returnMsg(res, upUtils.getXMLObj(2));
            }
        });
    });
}

/**
 * 心跳
 * @param paramsObject
 */
RedisClientManager.prototype.unique = function(req, res){
    var _self = this;
    var token = req.up_params.online;
    var paramsObject = req.up_params;

    this.redisClient.HGETALL('tk:' + token, function (err, tokenInfo) {
        if (!err) {
            if (!_.isNull(tokenInfo)) {
                var userKey = "u:"+tokenInfo.uid;

                //根据token获得用户信息
                _self.redisClient.HGETALL(userKey, function(err, userInfo){

                    /**==============test  */
                    userInfo = _.extend(userInfo,{
                        cid : "60004",
                        pwd : "5f900445da139983d9fb030819948540",
                        reg_time : "1359353418.873",
                        ut : "1",
                        cer_time : "0",
                        rights:'[{"mid" : "1","end_date" : "2012-12-13"},{"mid" : "2","end_date" : "2012-12-13"}]',
                        mt : "",
                        bp :""
                    });

                    /**==============test  */
                    if(err) {
                        redisLog.error("unique : hgetall "+userKey+" error : ", err);
                        _self.returnMsg(res, upUtils.getXMLObj(1));
                    }

                    if(_.isNull(userInfo)){
                        redisLog.error("unique : hgetall "+userKey+" Empty : ");
                        _self.returnMsg(res, upUtils.getXMLObj(1));
                    }
                    console.log(token+"===="+userKey);
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
                    _self.redisClient.EXPIRE('tk:' + token, config.token_expire);//seconds

                    _self.returnMsg(res, upUtils.getXMLObj(-1,objResult,paramsObject.id));
                    //发出记录日志事件？？？？？？？？？？
                });
            } else {
                redisLog.error('unique TOKEN_NOT_EXISTS : ',[token,' TOKEN_NOT_EXISTS'].join(""));
                _self.returnMsg(res, upUtils.getXMLObj(1));
            }
        } else {
            redisLog.error('unique redis HGETALL error:', {"token" : token, "err" : JSON.stringify(err)});
            _self.returnMsg(res, upUtils.getXMLObj(1));
        }
    });
}

/**
 * 退出
 * @param paramsObject
 */
RedisClientManager.prototype.logout = function(req, res){
    try{
        var token = req.up_params.online;
        if (!_.isEmpty(token) && _.isString(token)) {
            this.redisClient.DEL('tk:' + token);
            this.returnMsg(res, upUtils.getXMLObj(-2));
            //发出记录日志事件？？？？？？？？？？
        } else {
            redisLog.error('logout: token empty', token);
            throw new Error("redis del token err");
        }
    }catch(err){
        redisLog.error("logout: redis del token",err);
        this.returnMsg(res, upUtils.getXMLObj(-2));
    }
}

/**
 * 踢出
 * @param paramsObject
 */
RedisClientManager.prototype.tickout = function(req, res){
    try{
        var token = req.up_params.online;
        if (!_.isEmpty(token) && _.isString(token)) {
            this.redisClient.DEL('tk:' + token);
            this.returnMsg(res, upUtils.getXMLObj(-2));
            //发出记录日志事件？？？？？？？？？？
        } else {
            redisLog.error('logout: token empty', token);
            throw new Error("redis del token err");
        }
    }catch(err){
        redisLog.error("logout: redis del token",err);
        this.returnMsg(res, upUtils.getXMLObj(-2));
    }
}

