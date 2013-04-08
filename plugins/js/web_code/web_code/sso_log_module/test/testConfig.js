/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-3-1
 * Time: 上午7:11
 * To change this template use File | Settings | File Templates.
 */
var config = require("../config/config.json");

var auto = config.auto;
console.log(auto);

/*if(auto === 'bj')
    console.log(JSON.stringify(config.rabbitmq_bj));
else if(auto === 'gd')
    console.log(JSON.stringify(config.rabbitmq_gd));
else
    console.log(JSON.stringify(config.rabbitmq_test));*/

//var log = require('../lib/ssoLogger');

//errorError: EEXIST, mkdir '/Volumes/test_disk/workspace/nodeWorkspace/sso/sso_log_module/log'

//log.error('dsfasdfasdfsdfasdfasdfasdfa');



var fs = require('fs');
/**处理日志目录问题*/
var currDir = process.cwd();
var logDir = [currDir+'/log'].join('');

//fs.readdir(logDir, function(err){
  //  if(err){
        fs.mkdir(logDir, function createDir(err){
            if(!err){
                console.info('create dir('+logDir+') success!');
            }else{
                console.log(err.code);
                if(err.code !='EEXIST'){
                    console.error('create dir('+logDir+');'+err);
                }
            }
        });
//    }
//});
