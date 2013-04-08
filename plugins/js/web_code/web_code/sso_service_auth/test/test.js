/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-28
 * Time: 上午4:31
 * To change this template use File | Settings | File Templates.
 */
var events = require("events")
    ,util = require("util");

exports.createMangerFactory = function(){
    return new test();
}

function test (){
    events.EventEmitter.call(this);
    /**
    var _self = this;
    setTimeout(function(){
        _self.emit("ready");
    },1000*3);
     **/
    this.once("ready", function(){
        console.log("self ready ");
    });
}
/**继承事件发射器   */
util.inherits(test, events.EventEmitter);


/**
 * webbench -c 1 -t 60 -2 --get http://192.168.240.113:52562/auth.do?cmd=login&encodetype=1&id=temp2&pwd=e2834e84b6ad91745b22fcb32fae5096&mac=1C4BD62F77BD&cpu=00020655h&diskid=&campainid=28&phone=&opt=&exemd5=&otherinfo=&crc=1959828222

 webbench -c 100 -t 60 -2 --get http://192.168.240.113:52562/auth.do?cmd=unique&id=temp2&online=c24abeb0-6e9f-11e2-a6f8-859ee949697f


 ./ab -n 10 -c 1000 http://192.168.240.113:52562/auth.do?cmd=unique&amp;id=temp2&amp;online=3cbb76b0-6f33-11e2-9453-5d6d3e9d538d

 */



