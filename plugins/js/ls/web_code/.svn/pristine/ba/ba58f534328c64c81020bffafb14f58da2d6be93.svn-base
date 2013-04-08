/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-4
 * Time: 上午2:25
 * To change this template use File | Settings | File Templates.
 *
 * 使用了cluster
 *
 *
 */
/** log       */
var winston  = require('./lib/winstonLog')
    ,mainLog = winston.winston//主日志
    ,expressLog = winston.expressLog//express log
/** Cluster        */
    ,cluster = require('cluster')
/*** os            */
    ,os = require('os')
/** express   */
    ,express = require('express')
    ,app = new express()
/** config     */
    ,config = require('./config/config.json')
/** SSOService     */
    ,ssoService = require('./service/ssoAuthService').SSOService
/** underscore     */
    ,_ = require('underscore')
/** upUtils        */
    ,upUtils = require('./lib/utils').upUtils
/** moment         */
    ,moment = require('moment');
var fs = require('fs');

cluster.setMaxListeners(0);

if(cluster.isMaster){

    /**处理日志目录问题*/
    var currDir = process.cwd();
    var logDir = [currDir+'/log'].join('');
    fs.readdir(logDir, function(err){
        if(err){
            fs.mkdir(logDir, function createDir(err){
                if(!err){
                    console.info('create dir('+logDir+') success!');
                }else{
                    if(err.code !='EEXIST'){
                        console.error('create dir('+logDir+');'+err);
                    }
                }
            });
        }
    });

    var numCPUs = os.cpus().length;
    //只加载一个numCPUs-1个子进程
    numCPUs = (numCPUs===1)?numCPUs=1 : numCPUs-1;
    mainLog.info('system cups nums : '+ numCPUs);
    for(var i=0; i<numCPUs;i++){
        cluster.fork();
    }

    /**cluter evnets */
    /**exit events   */
    cluster.on('exit', function(worker, code){
        if(code != 0 ){
            mainLog.error('worker #'+worker.id+' exited with error code : '+code+' restart ....');
            cluster.fork();
        }else{
            mainLog.warn('worder suicide, exitd success #'+worker.id);
        }
    });

    /**disconnect
     * 当worker has dies or call .destroy()
     * 当调用.disconnect() 会emit disconnect and exit events */
    cluster.on('disconnect', function(worker){
        mainLog.info('this worker #'+worker.id+' has disconnected! is suicide : '+worker.suicide);
    });

    /**
     * 监听程序退出事件
     */
    process.once('exit', function () {
        mainLog.info('exit cluter app ...');
        console.log('exit cluter app ...');
    });

    /**
     * 监听未处理异常
     */
    process.once('uncaughtException', function (err) {
        mainLog.error('cluter Uncaught Exception:'+ err.stack);
        cluster.disconnect(function(){
            process.nextTick(function(){
                process.exit(1);
            });
        });
    });

    /**
     * ctrl c
     */
    process.once('SIGINT', function () {
        mainLog.info('cluter shutting down...');
        console.log('cluter shutting down...');
        cluster.disconnect(function(){
            process.nextTick(function(){
                process.exit(0);
            });
        });
    });
}else if(cluster.isWorker){
    //cluter.worker.disconnect();  suicide=true; emit disconnect events;exit and disconnect delay
    //cluster.worker.destroy();   suicide=true; emit exit and disconnect events;
    //process.exit(0); //suicide =true;
    //process.exit(1); //suicide =false;

    //加载worker
    //require('./worker/worker');
    /**
     * 初始化rabbitmq
     * */
    ssoService.init();
    /**
     * 载入客户端提交参数
     * @param req
     * @param res
     * @param next
     */
    var loadParams = function(req, res, next){
        var now = moment();
        req.up_params={
            cmd :((_.isUndefined(req.query.cmd)|| _.isEmpty(req.query.cmd))?'':req.query.cmd),
            encodetype :((_.isUndefined(req.query.encodetype)|| _.isEmpty(req.query.encodetype))?'':req.query.encodetype),
            id :((_.isUndefined(req.query.id)|| _.isEmpty(req.query.id))?'':req.query.id),
            pwd : ((_.isUndefined(req.query.pwd)|| _.isEmpty(req.query.pwd))?'':req.query.pwd),
            mac : ((_.isUndefined(req.query.mac)|| _.isEmpty(req.query.mac))?'':req.query.mac),
            cpu : ((_.isUndefined(req.query.cpu)|| _.isEmpty(req.query.cpu))?'':req.query.cpu),
            diskid : ((_.isUndefined(req.query.diskid)|| _.isEmpty(req.query.diskid))?'':req.query.diskid),
            campainid : ((_.isUndefined(req.query.campainid)|| _.isEmpty(req.query.campainid))?'0':req.query.campainid),
            phone : ((_.isUndefined(req.query.phone)|| _.isEmpty(req.query.phone))?'':req.query.phone),
            opt : ((_.isUndefined(req.query.opt)|| _.isEmpty(req.query.opt))?'':req.query.opt),
            exemd5 : ((_.isUndefined(req.query.exemd5)|| _.isEmpty(req.query.exemd5))?'':req.query.exemd5),
            otherinfo : ((_.isUndefined(req.query.otherinfo)|| _.isEmpty(req.query.otherinfo))?'':req.query.otherinfo),
            crc : ((_.isUndefined(req.query.crc)|| _.isEmpty(req.query.crc))?'':req.query.crc),
            online : ((_.isUndefined(req.query.online)|| _.isEmpty(req.query.online))?'':req.query.online),
            t : ((_.isUndefined(req.query.t)|| _.isEmpty(req.query.t))?now.format('YYYY-MM-DD'):req.query.t),
            isOk : true,
            isOkErrorCode:0,
            originalUrl : req.originalUrl
        };
        next();
    }
    /**
     * 验证参数
     * @param req
     * @param res
     * @param next
     */
    var checkParams = function(req, res, next){
        /**params */
        var upParams = req.up_params;
        if(_.isEmpty(upParams.id) || _.isEmpty(upParams.cmd)){
            expressLog.error("checkParams error : id or cmd not empty");
            upParams.isOk = false;
        }else if(_.isEqual(upParams.cmd, "unique") && _.isEmpty(upParams.online) ){
            expressLog.error("checkParams error : online not empty");
            upParams.isOk = false;
            upParams.isOkErrorCode = 6;
        }else if(_.isEqual(upParams.cmd, "login") && _.isEmpty(upParams.crc)){
            expressLog.error("checkParams error : crc not empty");
            upParams.isOk = false;
            upParams.isOkErrorCode = 5;
        }
        next();
    }
    /** express*/
    //app.use(express.logger('dev')); //test
    /**
     * routes
     *
     *访问地址： *nginx反向代理需要将 跳转到http://auth.upchina.com/auth.do
     *
     * 接口说明：
     * http://redmine.upchina.com/redmine/projects/sso/wiki/旧认证协议_from_贺耀华
     */
    app.get('/auth.do',[loadParams,checkParams], function(req, res){
        //console.log(req.up_params.isOk);
        //ssoService.authManager(req, res);
        if(req.up_params.isOk === true){
            ssoService.authManager(req.up_params,function doAuthManager(err, resObject){
                if(!err){
                    res.send(resObject);
                }else{
                    expressLog.error(err.errorMsg);
                    res.send(upUtils.getXMLObj(err.errorCode));
                }
            });
        }else{
            res.send(upUtils.getXMLObj(req.up_params.isOkErrorCode));
        }

    });
    /**
     * error
     */
    app.use(function(err, req, res, next){
        expressLog.error('error : '+err.stack);
        res.status(500);
        res.send('server error');
    });
    /**
     * 404
     */
    app.use(function(req, res, next){
        expressLog.error('not found route : '+req.path);
        res.status(404);
        res.send('not found route');
    });
    /** setting http server port */
    app.listen(config.http_server_port);

    console.log('Express started on port : '+config.http_server_port);
    mainLog.info('Express started on port : '+config.http_server_port);

    /**
     * 监听程序退出事件
     */
    process.once('exit', function () {
        mainLog.info('exit app ...');
    });

    /**
     * 监听未处理异常
     */
    process.once('uncaughtException', function (err) {
        mainLog.error('worker #'+cluster.worker.id+' Uncaught Exception:'+err.stack);
        cluster.worker.disconnect();//通知cluster 此worker已经die
        process.nextTick(function(){
            ssoService.destroyAllNow();
            ssoService.destoryRabbitMQLog();
            process.exit(1);
        });
    });

    /**
     * ctrl c
     */
    process.once('SIGINT', function () {
        mainLog.info('worker #'+cluster.worker.id+' shutting down...');
        console.log('worker #'+cluster.worker.id+' shutting down...');
        cluster.worker.disconnect();
        process.nextTick(function(){
            ssoService.destroyAllNow();
            ssoService.destoryRabbitMQLog();
            process.exit(0);
        });
    });
}

