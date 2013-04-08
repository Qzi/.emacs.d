/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-3-7
 * Time: 上午8:39
 * To change this template use File | Settings | File Templates.
 */

/*var requests = require('superagent');
var fs  = require('fs');

//var stream = fs.createReadStream(process.cwd()+'/test/superagentData.csv');

var req = requests.post('http://113.105.144.18:806/Handler/User/UserLoginDataSync.ashx');
req.attach('file',process.cwd()+'/csv/20130311071913.csv');
//req.pipe(stream);
req.end(function(res){
    //console.log(JSON.stringify(res));
    console.log(res);
    console.log(res.statusCode);
    console.log(JSON.stringify(res.text));
    console.log(JSON.parse(res.text).result);
});*/

/*console.log('aaaaaa');

var _ = require('underscore');

fs.readdir(process.cwd()+'/test',function(error,files){
    _.each(files,function(val, index, list){
        console.log(val);
    });
    console.log(files);
});

var files = fs.readdirSync(process.cwd()+'/test');
_.each(files,function(val, index, list){
    console.log(val);
});*/

/*var async = require('async');
async.series([
    function(callback){
        callback(null,'one');
    },
    function(callback){
        callback(null,'two');
    }
],function(err,results){
    console.log(err+' : '+results);
});*/


//接收命令行参数,
/***
 * forever stdinTest.js  asdfasfsadfadfasfd adfaf

 0: /usr/local/bin/node
 1: /Volumes/test_disk/workspace/nodeWorkspace/test/process/stdinTest.js
 2: asdfasfsadfadfasfd
 3: adfaf

 */
//process.argv.forEach(function (val, index, array){
 //   console.log(index+': '+val);
//});
var dataLen = 1001;
console.log("总数据条数"+dataLen);
var pageCount = dataLen < 1000 ? 1 : Math.ceil(dataLen/1000);
console.log("总数据条数"+pageCount);