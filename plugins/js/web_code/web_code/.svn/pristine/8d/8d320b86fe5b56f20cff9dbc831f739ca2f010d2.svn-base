/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-28
 * Time: 上午4:38
 * To change this template use File | Settings | File Templates.
 */
var redis = require("redis");
var test = require("./test");
var config = require("../config/config.json");


var testEvent = test.createMangerFactory();


var redisClient = redis.createClient(config.redis.port, config.redis.host);

/**
 * ready events
 */
redisClient.once("ready", function(){
    console.log("redis server is ready!");
    testEvent.emit("ready");//发出ready事件
});

testEvent.once("ready", function(){
    console.log("manager events test");
});
