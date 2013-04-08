/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-18
 * Time: 上午5:06
 * To change this template use File | Settings | File Templates.
 */

var sendSevice = require('../sso_auth_log/SSOLogSend').SSOLogSendService;


//服务器启动是优先调用此函数
sendSevice.init();
var post = {uid:"username",cid:600004,mac:"",cpu:"",diskid:"",exemd5:"",opt:"",otherinfo:"",actiontype:1,campaignId:28};
setTimeout(function(){
    sendSevice.sendLogMsg(post);
   // sendSevice.sendLogMsg(post);
    //sendSevice.sendLogMsg(post);
   // sendSevice.sendLogMsg(post);
},8000)

setTimeout(function(){
    //sendSevice.sendLogMsg(post);
    //sendSevice.sendLogMsg(post);
    //sendSevice.sendLogMsg(post);
    //sendSevice.sendLogMsg(post);
    //console.log('启动快速写入');

},10000)

setTimeout(function(){
    sendSevice.sendLogMsg(post);
    console.log('第20S发送');
},20000);

setTimeout(function(){
    sendSevice.sendLogMsg(post);
    console.log('第40S发送');
},40000);





//commonPool.initSendLogMsgPool();

process.once("uncaughtException", function (err) {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

