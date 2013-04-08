/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-7
 * Time: 上午4:01
 * To change this template use File | Settings | File Templates.
 */
var amqp = require("amqp");
var config = require("../config/config.json");
//, {defaultExchangeName : config.rabbitmq.exchangeName}
var server = amqp.createConnection(config.rabbitmq.server_option);
//console.log(server);
server.on("ready", function(){
    console.log("server connection ....");

    var exchange = server.exchange(config.rabbitmq.logExchangeName);

    exchange.on('open', function(){
        console.log('Exchange '+exchange.name+' is open! ');
    });
    //console.log(server.exchanges);
    /**
     *
     */
    var queue = server.queue(config.rabbitmq.logQueueName, function(){
        console.log('Queue '+queue.name+' is open');
        queue.bind(exchange,config.rabbitmq.logQueueName);
    });
    //exchange.publish(config.rabbitmq.logQueueName,{one:2,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
    queue.on('queueBindOk',function(){
        console.log('queueBindOk');

        //exchange.publish(config.rabbitmq.logQueueName,{one:1,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
        //exchange.publish(config.rabbitmq.logQueueName,{one:2,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
       // exchange.publish(config.rabbitmq.logQueueName,{one:3,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
       // exchange.publish(config.rabbitmq.logQueueName,{one:4,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
       // exchange.publish(config.rabbitmq.logQueueName,{one:5,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
       // exchange.publish(config.rabbitmq.logQueueName,{one:6,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});
       exchange.publish(config.rabbitmq.logQueueName,{one:7,tow:4},{contentType:"application/json",contentEncoding:"UTF-8",deliveryMode:1});

        console.log('publish send message ok');
        setTimeout(function(){
            server.queueClosed(config.rabbitmq.logQueueName);
            server.exchangeClosed(config.rabbitmq.logExchangeName);

            //queue.destroy({ifEmpty:false,ifUnused:false});
            //exchange.destroy({ifUnused:false});
            server.end();
        }, 1500);
    });
});


//error: Uncaught Exception:Error: connect EADDRNOTAVAIL
