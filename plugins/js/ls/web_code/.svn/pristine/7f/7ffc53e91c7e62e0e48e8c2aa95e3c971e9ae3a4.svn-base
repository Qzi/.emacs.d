/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-24
 * Time: 上午3:42
 * To change this template use File | Settings | File Templates.
 *
 * 统一日志
 */
var winston = require("winston");

/**处理目录问题*/
var currDir = process.cwd();

//控制台日志
winston.add(winston.transports.File, {filename:currDir+'/log/console-logs.log',level:'error',maxsize:4194304,maxFiles:3});
//未处理error
winston.handleExceptions(new winston.transports.File({filename:currDir+'/log/handleexception-logs.log',level:'error',maxsize:4194304,maxFiles:3}));
//关闭打印控制台  上线后打开此句
winston.remove(winston.transports.Console);

//redis 日志
var redisLog = new (winston.Logger)({
    transports: [
        //new (winston.transports.Console)(),//上线后注释此句
        new (winston.transports.File)({filename:currDir+'/log/redis-logs.log',level:'error',maxsize:4194304,maxFiles:3})
    ]
});

//express 日志
var expressLog = new (winston.Logger)({
    transports: [
       // new (winston.transports.Console)(),//上线后注释此句
        new (winston.transports.File)({filename:currDir+'/log/express-logs.log',level:'error',maxsize:4194304,maxFiles:3})
    ]
});

//service 日志
exports.servcieLog = new (winston.Logger)({
    transports: [
        //new (winston.transports.Console)(),//上线后注释此句
        new (winston.transports.File)({filename:currDir+'/log/servcie-logs.log',level:'error',maxsize:4194304,maxFiles:3})
    ]
});


exports.winston = winston;
exports.redisLog = redisLog;
exports.expressLog = expressLog;
