/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-18
 * Time: 上午3:04
 * To change this template use File | Settings | File Templates.
 *
 * 接收rabbitmq消息并写入数据库
 *
 */
/**  rabbitMqLog      */
var rabbitMqLog = require('../lib/ssoLogger').rabbitMqLog,
    mainLog = require('../lib/ssoLogger').winston,
/** underscore     */
    _ = require("underscore"),
/**  amqp             */
    amqp = require('amqp'),
/** up_log*/
    upLog = require("./SSOLogForMysql").createUPSSOLogFactory(),
/**  config           */
    config = require('../config/config.json');

var fs = require('fs');
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

/**自动匹配正式环境*/
var rabbitmqConfig = (function(){
    var auto = config.auto;
    if(auto === 'bj')
        return config.rabbitmq_bj;
    else if(auto === 'gd')
        return config.rabbitmq_gd;
    else
        return config.rabbitmq_test;
})();

var SSOLogReceiveService = {
    _client : null,
    _bindFlag : false,//绑定状态
    /**
     * 初始化
     */
    init:function(){
        if(!this._bindFlag){
            this._client = amqp.createConnection(rabbitmqConfig.client_option);
            var _self = this;
            this._client.once("ready", function(){
                rabbitMqLog.info('SSOLogReceiveService class init method connection success! ');
                _self._bindFlag = true;
                //------
            });
            /*this._client.once('heartbeat',function(){
                rabbitMqLog.info('SSOLogReceiveService class init method heartbeat event');
            });*/

            this._client.once('error', function(err){
                _self.destroy();
                throw new Error('rabbitmq connection error : '+err);
            });
        }
    },
    /**
     * 接收消息
     */
    receiveMsg : function(){
        var _self = this;

        this._client.queue(rabbitmqConfig.logQueueName, function(queue){
            rabbitMqLog.info('SSOLogReceiveService class receiveMsg method  Queue '+queue.name+' is open! ');
            queue.bind(rabbitmqConfig.logQueueName,function(){
                queue.subscribe(function(message, headers, deliveryInfo, m){
                    try{
                        if(_.isEmpty(message) || !_.isObject(message)){
                            rabbitMqLog.error('SSOLogReceiveService class receiveMsg method message is empty or not object！');
                            return;
                        }
                        process.nextTick(function(){
                            upLog.emit("UP_SSO_EVENT_WRITE", message);
                        });
                        //_self._queue.shift();
                        //_self._client.queueClosed(config.rabbitmq.logQueueName);
                        //rabbitMqLog.info('SSOLogReceiveService class receiveMsg method  Queue '+queue.name+' closed! ');
                    }catch(err){
                        rabbitMqLog.error('SSOLogReceiveService class receiveMsg method receive or input DB error \n'+JSON.stringify(message)+'\n '+err);
                    }
                });
            });

        });
    },
    destroy:function(){
        if(this._client){
            //this._client.queueClosed(config.rabbitmq.logQueueName);
            this._client.end();
        }
    },
    /**
     * main start
     */
    start:function(){
        this.init();
        var _self = this;
        setTimeout(function(){
            _self.receiveMsg();
            console.log("service started...");
        },5000);
    }
}

//start
SSOLogReceiveService.start();
/**
 * 监听程序退出事件
 */
process.once("exit", function () {
   // console.log(SSOLogReceiveService._client);
    mainLog.info("exit app ...");
});

/**
 * 监听未处理异常
 */
process.once("uncaughtException", function (err) {
    mainLog.error("Uncaught Exception:"+err);
    SSOLogReceiveService.destroy();
    upLog.destroyAllNow();
    process.exit(1);
});

/**
 * ctrl c
 */
process.once("SIGINT", function () {
    mainLog.info("shutting down...");
    console.log("shutting down...");
    SSOLogReceiveService.destroy();
    upLog.destroyAllNow();
    process.exit(0);
});
//connect EHOSTUNREACH
//connect EADDRNOTAVAIL