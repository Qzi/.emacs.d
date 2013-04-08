/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-3-8
 * Time: 上午4:03
 * To change this template use File | Settings | File Templates.
 *
 * 本程序将sso日志已post发送给南方crm接口
 *
 * 步骤：
 * 1. 检查csv目录是否有未发送的*.csv文件，如果有先发送这些文件，
 * 2. 读取上次提取数据的时间，如果为空则读取所有数据，否则读取》=上次读取时间的日志数据库并将数据写入.csv文件中，
 * 3. 发送此次数据文件，如果发送成功将删除此文件，否则将保留此文件等待下次发送
 * 4. 记录此次读取数据的时间，以当前数据最大的时间为准并写入文件。
 *
 *
 * 本程序启动参数说明：
 * forever ssoLogSendToCrm.js [option]
 *      option 说明：
 *          option只接收一个参数，如果不传入默认为测试环境
 *          bj：北方正式环境
 *          gd：南方正式环境
 */
/** superagent        */
var fs  = require('fs');
var currDir = process.cwd();
var logDir = [currDir+'/log'].join('');
var csvDir = [currDir+'/csv'].join('');
var dataLogDir = [currDir+'/dataLog'].join('');

//建立dataLogDir目录
fs.mkdir(dataLogDir, function createDir(err){
    if(!err){
        console.info('create dir('+dataLogDir+') success!');
    }else{
        if(err.code !='EEXIST'){
            console.error('create dir('+dataLogDir+');'+err);
        }
    }
});

//建立csv目录
fs.mkdir(csvDir, function createDir(err){
    if(!err){
        console.info('create dir('+csvDir+') success!');
    }else{
        if(err.code !='EEXIST'){
            console.error('create dir('+csvDir+');'+err);
        }
    }
});
//建立日志目录
fs.mkdir(logDir, function createDir(err){
    if(!err){
        console.info('create dir('+logDir+') success!');
    }else{
        if(err.code !='EEXIST'){
            console.error('create dir('+logDir+');'+err);
        }
    }
});


var requests = require('superagent');
/**  generic-pool     */
var poolModule = require("generic-pool");
/**  mysql            */
var mysql = require('mysql');
/** config            */
var config = require('../config/config.json');
/** utils             */
var util = require('util');
/** underscore        */
var _ = require('underscore');
/** node event        */
var events = require('events');
/*** winston          */
var mainLog = require('../lib/ssoLogger').upSSOLogSendToCrm;
var moment = require('moment');
var async = require('async');

var SSOLogSendToCrm = {
    _readPool : null,
    _time : null,
    _crmUrl : null,
    _refreshTime : null,
    _lastDataTime : '/lastDataTime',
    /**
     * 1.初始化连接池
     */
    init : function(mysqlConfig){
        this._readPool = poolModule.Pool({
            name               : "read_mysql",
            create             : function(callback){
                var client = mysql.createConnection(mysqlConfig.mysql_option);
                callback(null,client);
            },
            destroy            : function(client){
                client.end();
            },
            max                : mysqlConfig.poolMax,
            min                : mysqlConfig.poolMin,
            idleTimeoutMillis  : mysqlConfig.poolTimeOutMillis,
            log                : mysqlConfig.poolLog
        });
        mainLog.info('SSOLogSendToCrm class init method success! \nconfig : '+JSON.stringify(mysqlConfig));
    },
    /**
     * 启动服务
     */
    start : function(){
       /*async.series([
            SSOLogSendToCrm.checkCsvDir
        ],function(err,results){
            if(!err){
                //读取数据库并发送数据
                mainLog.info('程序正常执行');

            }
        });*/
        SSOLogSendToCrm.checkCsvDir(function(err){
            if(!err){
                //读取数据库并发送数据
                mainLog.info('程序正常执行');
                //读取dataLogDir 文件记录的上次记录的时间
                //读取数据库数据
                fs.readFile(dataLogDir+SSOLogSendToCrm._lastDataTime, 'utf-8', function(err,data){
                    if(!err){
                        SSOLogSendToCrm.getDataForMysql(data, SSOLogSendToCrm.formatSSOLogData);
                    }else{
                        SSOLogSendToCrm.getDataForMysql(null, SSOLogSendToCrm.formatSSOLogData);
                    }
                });
            }else{
                mainLog.error('SSOLogSendToCrm class start method error'+err);
            }
            //设置下次读取数据的时间
            if(!SSOLogSendToCrm._time){
                clearTimeout(SSOLogSendToCrm._time);
            }
            SSOLogSendToCrm._time = setTimeout(function(){
                SSOLogSendToCrm.start();
            },SSOLogSendToCrm._refreshTime);
        });
    },
    /**
     * 检查csv目录
     */
    checkCsvDir : function(callback){
        var _self  = this;
        fs.readdir(csvDir, function(err,files){
            if(!err){
                if(files.length > 0){
                    async.each(files, function(item,callback){
                        SSOLogSendToCrm.sendToCrm(item,function doSendToCrm(err, body){
                            if(!err){
                                mainLog.info(item+ ' send to crm interface ok!');
                                process.nextTick(function(){
                                    fs.unlinkSync(csvDir+'/'+item);
                                });
                                callback(null,body);
                            }else{
                                mainLog.error(err);
                            }
                        });
                    },function(err){
                        if(!err){
                            callback(null);
                        }else{
                            callback(err);
                        }
                    });
                   /* _.each(files,function(val){
                        console.log('------------'+val);
                        //(function(){
                            SSOLogSendToCrm.sendToCrm(val,function doSendToCrm(err, body){
                                if(!err){
                                    fs.unlinkSync(csvDir+'/'+val);
                                    callback(null);
                                }
                            });
                        //})();
                    });*/
                }else{
                    callback(null);
                }

            }
        });
    },
    /**
     * 格式化数据，写入文件，发送至crm
      * @param err
     * @param data
     */
    formatSSOLogData : function(err,data){
        if(!err){
            //处理数据,
            //console.log(data);
            if(!_.isEmpty(data)){
                var now = moment();
                var filename = now.format('YYYYMMDDHHmmss');

                var lastTime = '';
                var dataLen = data.length;
                //console.log("总数据条数"+dataLen);
                var pageCount = dataLen < 1000 ? 1 : Math.ceil(dataLen/1000);
                //console.log("总数据条数"+pageCount);
                for(var i=1;i<=pageCount;i++){
                    var filePath  = [csvDir,'/',filename,'-',i,'.csv'].join('');
                    var start = 0;
                    var end = 1000;
                    if(i > 1){
                        start=(i-1)*1000
                    }
                    if(i === pageCount){
                        end =dataLen;
                    }else{
                        end = i*1000;
                    }
                    //console.log(start+'--'+end+'\n');
                    if(i === 1){
                        lastTime = data[0].time;
                        //console.log(lastTime);
                    }

                    var logData = [];
                    for(var j= start;j<end;j++){
                        var item =data[j];
                        var values = _.values(item);
                        if(j === start){
                            var keys = _.keys(item);
                            logData.push(keys);
                            logData.push(values);
                        }else{
                            logData.push(values);
                        }
                    }
                    fs.writeFileSync(filePath,logData.join('\n'),'utf-8');
                }
               SSOLogSendToCrm.checkCsvDir(function(err){
                    if(err){
                        mainLog.error('SSOLogSendToCrm class start method error'+err);
                    }else{
                        fs.writeFileSync(dataLogDir+SSOLogSendToCrm._lastDataTime,lastTime,'utf-8');
                        //console.log('ok');
                    }
                });

                /*_.each(data,function(item,index){
                    var values = _.values(item);
                    if(index === 0){
                        var keys = _.keys(item);
                        lastTime = item.time;
                        logData.push(keys);
                        logData.push(values);
                    }else{
                        logData.push(values);
                    }
                });

                fs.writeFileSync([csvDir,'/',filename,'.csv'].join(''),logData.join('\n'),'utf-8');
                //console.log('fd:\n'+fd);
                SSOLogSendToCrm.sendToCrm([filename,'.csv'].join(''),function(err,body){
                    if(!err){
                        mainLog.info(filename+ ' send to crm interface ok!');
                        process.nextTick(function(){
                            fs.unlinkSync([csvDir,'/',filename,'.csv'].join(''));
                            fs.writeFileSync(dataLogDir+SSOLogSendToCrm._lastDataTime,lastTime,'utf-8');
                        });
                    }else{
                        mainLog.error(err);
                    }
                })*/
                //console.log(logData.join('\n'));
            }
        }else{
            mainLog.error('SSOLogSendToCrm class start method formysql callback error'+err);
        }
    },
    getDataForMysql : function(dateTime,callback){
        var _self = this;
        var sql = 'select id,uid,cid,mac,cpu,diskid,exemd5,opt,otherinfo,actiontype,campaignId,DATE_FORMAT(`time`,\'%Y-%m-%d %H:%i:%s\')as `time`,token,isOld from user_log ';
        if(!_.isNull(dateTime)){
            sql = sql+' where `time`>\''+dateTime+'\'';
        }
        //sql = sql +' where id=0';
        sql = sql+' order by `time` desc';
        mainLog.info('sql : \n'+sql);
        _self._readPool.acquire(function(err, client){
            if(!err){
                client.query(sql, function(err,results){
                    _self._readPool.release(client);//将client 归还 pool

                    if(!err){
                        callback(null,results);
                    }else{
                        callback(err);
                    }
                });
            }else{
                mainLog.error("SSOLogSendToCrm generic-pool acquire  err :",err);
                _self._readPool.release(client);//将client 归还 pool
            }
        });
    },
    /**
     * 向crm提交数据
     */
    sendToCrm : function(fileName, callback){
        mainLog.info('fileName:\n'+fileName);
        try{
            var _self = this;
            var req = requests.post(this._crmUrl);
            req.timeout(1200000);
            //req.set('charset','gb2312');
            req.attach('file',csvDir+'/'+fileName);
            req.end(function(res){
                //res.charset='gb2312';
                //console.log(res);
                var httpCode = res.statusCode;
                if(httpCode === 200){
                    var body = JSON.parse(res.text);
                    if(body.result === true){
                        callback(null, body);
                    }else{
                        callback('SSOLogSendToCrm class sendToCrm method send data error, errorCode:'+body.retcode);
                    }
                }else{
                    callback('SSOLogSendToCrm class sendToCrm method crm interface : '+_self._crmUrl+' error ; http status code : '+httpCode+';body:'+res.text);
                }
            });
        }catch(err){
            callback(err);
        }
    },
    /**
     * start app
     */
    startApp:function(){
        //获取命令参数
        var args = process.argv;
        if(args.length > 2 ){
            this._crmUrl = config.up_sso_log_send_to_crm_url;
            this._refreshTime = config.up_sso_log_send_to_crm_refresh;
            if(args[2] === 'bj'){//北京正式环境
                this.init(config.up_sso_log_db_for_mysql_read_bj);
                mainLog.info('use bj');
            }else if(args[2] === 'gd'){//南方正式环境
                this.init(config.up_sso_log_db_for_mysql_read_gd);
                mainLog.info('use gd');
            }else{//测试
                this._crmUrl = config.up_sso_log_send_to_crm_url_test;
                this._refreshTime = config.up_sso_log_send_to_crm_refresh_test;
                this.init(config.up_sso_log_db_for_mysql_test);
                mainLog.info('use test');
            }
        }else{//测试
            this._crmUrl = config.up_sso_log_send_to_crm_url_test;
            this._refreshTime = config.up_sso_log_send_to_crm_refresh_test;
            this.init(config.up_sso_log_db_for_mysql_test);
            mainLog.info('args length : '+args.length+'; use test');
        }
        //启动程序
        var _self =  this;
        setTimeout(function(){
            mainLog.info('sso login log send service started');
            console.log('sso login log send service started');
            _self.start();
        },5000);
    }
}

/**
 * start app
 *
 */
SSOLogSendToCrm.startApp();

/**
 * 监听程序退出事件
 */
process.once("exit", function () {
    mainLog.info("exit app ...");
});

/**
 * 监听未处理异常
 */
process.once("uncaughtException", function (err) {
    mainLog.error("SSOLogSendToCrm class Uncaught Exception:"+err.stack);
    process.exit(1);
});

/**
 * ctrl c
 */
process.once("SIGINT", function () {
    console.log("shutting down...");
    process.exit(0);
});