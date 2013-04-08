/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-24
 * Time: 上午3:40
 * To change this template use File | Settings | File Templates.\
 *
 * 未使用cluster
 */

/** log       */
var winston  = require("./lib/winstonLog")
    ,mainLog = winston.winston//主日志
    ,expressLog = winston.expressLog//express log

/** express   */
    ,express = require("express")
    ,app = new express()
/** config     */
    ,config = require("./config/config.json")
/**crc*/
    ,crc =  require("crc")
/**redis client
    ,redisClient = require("./redis/redisClient")*/
/** SSOService     */
    ,ssoService = require("./service/SSOService").SSOService
/** underscore     */
    ,_ = require("underscore")
/** upUtils        */
    ,upUtils = require("./lib/utils").upUtils
/** moment         */
    ,moment = require("moment");

/**
 * 载入客户端提交参数
 * @param req
 * @param res
 * @param next
 */
var loadParams = function(req, res, next){
    try{
        var now = moment();
        //console.log(now.format("YYYY-MM-DD"));
        req.up_params={
            cmd :((_.isUndefined(req.query.cmd)|| _.isEmpty(req.query.cmd))?"":req.query.cmd),
            encodetype :((_.isUndefined(req.query.encodetype)|| _.isEmpty(req.query.encodetype))?"":req.query.encodetype),
            id :((_.isUndefined(req.query.id)|| _.isEmpty(req.query.id))?"":req.query.id),
            pwd : ((_.isUndefined(req.query.pwd)|| _.isEmpty(req.query.pwd))?"":req.query.pwd),
            mac : ((_.isUndefined(req.query.mac)|| _.isEmpty(req.query.mac))?"":req.query.mac),
            cpu : ((_.isUndefined(req.query.cpu)|| _.isEmpty(req.query.cpu))?"":req.query.cpu),
            diskid : ((_.isUndefined(req.query.diskid)|| _.isEmpty(req.query.diskid))?"":req.query.diskid),
            campainid : ((_.isUndefined(req.query.campainid)|| _.isEmpty(req.query.campainid))?"0":req.query.campainid),
            phone : ((_.isUndefined(req.query.phone)|| _.isEmpty(req.query.phone))?"":req.query.phone),
            opt : ((_.isUndefined(req.query.opt)|| _.isEmpty(req.query.opt))?"":req.query.opt),
            exemd5 : ((_.isUndefined(req.query.exemd5)|| _.isEmpty(req.query.exemd5))?"":req.query.exemd5),
            otherinfo : ((_.isUndefined(req.query.otherinfo)|| _.isEmpty(req.query.otherinfo))?"":req.query.otherinfo),
            crc : ((_.isUndefined(req.query.crc)|| _.isEmpty(req.query.crc))?"":req.query.crc),
            online : ((_.isUndefined(req.query.online)|| _.isEmpty(req.query.online))?"":req.query.online),
            t : ((_.isUndefined(req.query.t)|| _.isEmpty(req.query.t))?now.format("YYYY-MM-DD"):req.query.t)
        };
        next();
    }catch (err){
        expressLog.error("LoadParams error : "+err);
        res.send(upUtils.getXMLObj(0));// 需要统一的返回日志
        return;
    }
}

/**
 * 验证参数
 * @param req
 * @param res
 * @param next
 */
var checkParams = function(req, res, next){
    try{
        /**params */
        var upParams = req.up_params;
        if(_.isEmpty(upParams.id) || _.isEmpty(upParams.cmd)){
            expressLog.error("checkParams error : id or cmd is not empty");
            res.send(upUtils.getXMLObj(0));
            return;
        }

        if(_.isEqual(upParams.cmd, "unique") && _.isEmpty(upParams.online) ){
            expressLog.error("checkParams error : online is not empty");
            res.send(upUtils.getXMLObj(6));
            return;
        }

        if(_.isEqual(upParams.cmd, "login") && _.isEmpty(upParams.crc)){
            expressLog.error("checkParams error : crc is not empty");
            res.send(upUtils.getXMLObj(5));
            return;
        }
        next();
    }catch(err){
        expressLog.error("checkParams error : "+err);
        //res.status(200);
        res.send(upUtils.getXMLObj(0));// 需要统一的返回日志
        return;
    }
}

//var manager = redisClient.createMangerFactory();
//接收redis manager “ready” 事件
//manager.once("ready", function(){

    app.use(express.logger('dev')); // 'short', 'tiny', 'dev'
    /**
     * routes
     *
     *访问地址： *nginx反向代理需要将 跳转到http://auth.upchina.com/auth.do
     *
     * 接口说明：
     * http://redmine.upchina.com/redmine/projects/sso/wiki/旧认证协议_from_贺耀华
     */
    app.get("/auth.do",[loadParams,checkParams], function(req, res){
        ssoService.authManager(req, res);
    });

    /**
     * error
     */
    app.use(function(err, req, res, next){
        expressLog.error("error : ", err.stack);
        res.status(500);
        res.send("server error");
        //next
    });

    /**
     * 404
     */
    app.use(function(req, res, next){
        expressLog.error("not found route : ", req.path);
        res.status(404);
        res.send("not found route");
    });

    /** setting http server port */
    app.listen(config.http_server_port);

    /** logs       */
    console.log("Express started on port : "+config.http_server_port);
    mainLog.info("Express started on port : "+config.http_server_port);
//});

/**
 * 监听 redclient end

manager.once("end", function(){
    manager._log.info("redis socket closed exit process!");
    process.exit(0);
});
 */
/**
 * 监听程序退出事件
 */
process.once("exit", function () {
    mainLog.info("exit app ...");
});

/**
 * 监听未处理异常
 */
process.once("uncaughtException", function (err) {
    mainLog.error("Uncaught Exception:", err);
   // manager.closeRedisClient();//关闭redis socket
    ssoService.destroyAllNow();
    ssoService.destroyAllNowForMySql();
    process.exit(1);
});

/**
 * ctrl c
 */
process.once("SIGINT", function () {
    mainLog.info("shutting down...");
    console.log("shutting down...");
    ssoService.destroyAllNow();
    ssoService.destroyAllNowForMySql();
    //manager.closeRedisClient();//关闭redis socket
    process.exit(0);
});