/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-7
 * Time: 上午1:31
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
/**处理日志目录问题*/
var currDir = process.cwd();
var logDir = [currDir+'/log'].join('');
fs.readdir(logDir, function(err){
    if(err){
        fs.mkdir(logDir, function createDir(err){
            if(!err){
                console.info('create dir('+logDir+') success!');
            }else{
                if(err.code !='EEXIST'){
                    console.error('create dir('+logDir+');'+err);
                }
            }
        });
    }
});

var SSOLogSendService = require('./sso_auth_log/SSOLogSend').SSOLogSendService;
exports.upSSOLogForMysql = require("./sso_auth_log/SSOLogForMysql");
exports.SSOLogSendService = SSOLogSendService;