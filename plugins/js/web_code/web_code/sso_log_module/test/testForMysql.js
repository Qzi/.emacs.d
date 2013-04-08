/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-27
 * Time: 上午8:50
 * To change this template use File | Settings | File Templates.
 */
var test = require("../index").upSSOLogForMysql;

var upLog = test.createUPSSOLogFactory();
//console.log(upLog);
var post = {uid:"username",cid:6000041,mac:"",cpu:"",diskid:"",exemd5:"",opt:"",otherinfo:"",actiontype:1,campaignId:28};

upLog.emit("UP_SSO_EVENT_WRITE",post);

