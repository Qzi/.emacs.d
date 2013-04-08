/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-18
 * Time: 上午3:25
 * To change this template use File | Settings | File Templates.
 *
 * sso 连接池服务模块 暂时未使用
 */

/**  generic-pool     */
var poolModule = require('generic-pool'),
/**  amqp             */
    amqp = require('amqp'),
/**  config           */
    config = require('../config/config.json');

exports.commonPool = {
    /**
     * 发送消息连接池
     */
    initSendLogMsgPool : function(){
        return poolModule.Pool({
            name               : "send_log_msg_amqp",
            create             : function(callback){
                var client = amqp.createConnection(config.rabbitmq.server_option);

                callback(null,client);
            },
            destroy            : function(client){
                client.end();
            },
            max                : 16,
            min                : 1,
            idleTimeoutMillis  : 300000,
            log                : false
        });
    }
}
