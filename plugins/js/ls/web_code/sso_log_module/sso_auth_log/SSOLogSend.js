/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-18
 * Time: 上午3:00
 * To change this template use File | Settings | File Templates.
 *
 * 发送日志消息
 */

/**  rabbitMqLog      */
var rabbitMqLog = require('../lib/ssoLogger').rabbitMqLog,
/** underscore     */
    _ = require("underscore"),
/**  amqp             */
    amqp = require('amqp'),
/** up_log*/
    upLog = require("./SSOLogForMysql").createUPSSOLogFactory(),
/**  config           */
    config = require('../config/config.json');

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


exports.SSOLogSendService = {
    _client : null,
    _exchange :null,
    _queue : null,
    _bindFlag : false,//绑定状态
    /**
     * 初始化
     */
    init : function(){
        if(!this._bindFlag){
            this._client = amqp.createConnection(rabbitmqConfig.server_option);
            var _self = this;
            this._client.once("ready", function(){
                rabbitMqLog.info('SSOLogSendService class init method connection success! ');
                _self._bindFlag = true;
                //------
                _self._client.exchange(rabbitmqConfig.logExchangeName, {type:"topic"}, function(exchange){
                    rabbitMqLog.info('SSOLogSendService class init method  Exchange '+exchange.name+' is open! ');

                    _self._client.queue(rabbitmqConfig.logQueueName, function(queue){
                        rabbitMqLog.info('SSOLogSendService class init method  Queue '+queue.name+' is open! ');

                        queue.bind(exchange,rabbitmqConfig.logQueueName, function(){
                            _self._exchange = exchange;
                            _self._queue = queue;
                        });
                    });
                });
                /**this._client.once('heartbeat',function(){
                    rabbitMqLog.info('SSOLogSendService class init method heartbeat event');
                });*/
                _self._client.once('error', function(err){
                    _self.destroy();
                    throw new Error('rabbitmq connection error : '+err);
                });
            });
        }
    },
    /**
     * 发送消息至消息队列
     * @param msg
     */
    sendLogMsg : function(msg){
        var _self = this;
        if(_.isEmpty(msg) || !_.isObject(msg)){
            rabbitMqLog.error('SSOLogSendService class sendLogMsg method Msg paramer is empty or not object！');
            return;
        }
        try{
            this._exchange.publish(rabbitmqConfig.logQueueName, msg , { contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:2}, function(status){
                if(status){
                    rabbitMqLog.error('SSOLogSendService class sendLogMsg method message send failed!\n'+JSON.stringify(msg));
                    throw new Error('SSOLogSendService class sendLogMsg method message send failed! '+JSON.stringify(msg));
                }
            });
        }catch(err){
            rabbitMqLog.error('SSOLogSendService class sendLogMsg method write msg error '+err+' data : '+JSON.stringify(msg));
            //error:调用db写入数据库
            process.nextTick(function(){
                upLog.emit("UP_SSO_EVENT_WRITE", msg);
            });

        }

    },
    /**
     *
     */
    destroy : function(){
        if(this._client){
            //this._client.queueClosed(config.rabbitmq.logQueueName);
            //this._client.exchangeClosed(config.rabbitmq.logExchangeName);
            this._client.end();
        }
        upLog.destroyAllNow();
    }
}

