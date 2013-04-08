/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-7
 * Time: 上午4:14
 * To change this template use File | Settings | File Templates.
 */
var amqp = require('amqp');
var config = require('../config/config.json');

var client = amqp.createConnection(config.rabbitmq.client_option);
//console.log(client);
client.on('ready', function(){
    console.log("client connection ....");

    var queue = client.queue(config.rabbitmq.logQueueName, function(){
        console.log('Queue '+queue.name+' is open');
        queue.bind(config.rabbitmq.logQueueName);
    });

    queue.on('queueBindOk',function(){
        console.log('queueBindOk');

        queue.subscribe({ask:true,prefetchCount:1}, function(message, headers, deliveryInfo){
            console.log('r msg'+JSON.stringify(message));
            //queue.shift();
        });
    });
});