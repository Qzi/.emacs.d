/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-18
 * Time: 上午3:28
 * To change this template use File | Settings | File Templates.
 *
 * sso 消息服务log
 *
 */

/**   winston      */
var winston = require("winston");

/**处理目录问题*/
var currDir = process.cwd();
/*
var logDir = [currDir+'/log'].join('');
fs.mkdir(logDir, function createDir(err, files){
    if(err){
        if(err.errorError === 'EEXIST'){
            console.log(logDir+' is exist!');
        }else{
            console.error('create dir('+logDir+') error'+err);
        }
    }
});
*/
//控制台日志
winston.add(winston.transports.File, {filename:currDir+'/log/ssoLog_console-logs.log',level:'error',maxsize:4194304,maxFiles:3});
//未处理error
winston.handleExceptions(new winston.transports.File({filename:currDir+'/log/ssoLog_handleexception-logs.log',level:'error',maxsize:4194304,maxFiles:3}));
//关闭打印控制台  上线后打开此句
winston.remove(winston.transports.Console);

/**   rabbitMqLog  */
exports.rabbitMqLog = new (winston.Logger)({
    transports: [
        //new (winston.transports.Console)(),//上线后注释此句
        new (winston.transports.File)({filename:currDir+'/log/ssoLog-servcie-forrabbitmq-logs.log',level:'error',maxsize:4194304,maxFiles:3})
    ]
});

exports.upSSOLogForMysql = new (winston.Logger)({
    transports: [
        //new (winston.transports.Console)(),//上线后注释此句
        new (winston.transports.File)({filename:currDir+'/log/ssoLog-servcie-formysql-logs.log',level:'error',maxsize:4194304,maxFiles:3})
    ]
});

exports.upSSOLogSendToCrm = new (winston.Logger)({
    transports: [
        //new (winston.transports.Console)(),//上线后注释此句
        new (winston.transports.File)({filename:currDir+'/log/ssoLog-servcie-forcrm-logs.log',level:'error',maxsize:4194304,maxFiles:3})
    ]
});
exports.winston = winston;
