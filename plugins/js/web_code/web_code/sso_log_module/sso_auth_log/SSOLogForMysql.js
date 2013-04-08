/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-31
 * Time: 上午3:55
 * To change this template use File | Settings | File Templates.
 */
/**  generic-pool     */
var poolModule = require("generic-pool");
/**  mysql            */
var mysql = require('mysql');
/**  mysql-queues     */
var queues = require("mysql-queues");
/** config            */
var config = require("../config/config.json");
/** utils      */
var util = require("util");
/** underscore     */
var _ = require("underscore");
/** node event */
var events = require("events");
/*** winston          */
var mysqlLog = require("../lib/ssoLogger").upSSOLogForMysql;

/**自动匹配正式环境*/
var mysqlConfig = (function(){
    var auto = config.auto;
    if(auto === 'bj')
        return config.up_sso_log_db_for_mysql_bj;
    else if(auto === 'gd')
        return config.up_sso_log_db_for_mysql_gd;
    else
        return config.up_sso_log_db_for_mysql_test;
})();

/**
 * factory
 */
exports.createUPSSOLogFactory = function(){
    return new UPSSOLog();
}

/**
 * log manager
 * @constructor
 */
function UPSSOLog(){

    var _self = this;
    events.EventEmitter.call(this);
    /**
     * mysql pool
     * @type {*}
     */
    this.pool = poolModule.Pool({
        name               : "mysql",
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

    /**
     * 监听写日志时间
     * @params   logObject    {}
     */
    this.on(config.UP_SSO_EVENT_WRITE, function(logObject){

        if(_.isUndefined(logObject) || _.isNull(logObject) || _.isEmpty(logObject) || !_.isObject(logObject)){
            mysqlLog.error("UP_SSO_EVENT_WRITE logObject no data");
            return ;
        }

        mysqlLog.info("user log str : "+JSON.stringify(logObject));

        /**  接收到数据后写入数据库  */
        _self.pool.acquire(function(err, client){

            if(err){
                mysqlLog.error("UP_SSO_EVENT_WRITE generic-pool acquire  err :",err);
                _self.pool.release(client);//将client 归还 pool
            }else{
                try{
                    queues(client, mysqlConfig.poolLog);
                    //打开事物
                    var trans  = client.startTransaction();
                    trans.query("INSERT INTO user_log SET ?",logObject,function(error, info){
                        if(error){
                            trans.rollback();//回滚事物
                            mysqlLog.error("MYSQL QUERY ERROR :"+error);
                            _self.pool.release(client);//将client 归还 pool
                        }else{
                            trans.commit();//commit
                            mysqlLog.info("INSERT INTO USER_LOG SUCCESS : "+JSON.stringify(info));
                            _self.pool.release(client);//将client 归还 pool
                        }
                    });
                    trans.execute();
                }catch(error){
                    mysqlLog.error("INSERT INTO USER_LOG ERROR :"+error);
                    _self.pool.release(client);//将client 归还 pool
                }
            }
        });
    });
}
/**继承事件发射器   */
util.inherits(UPSSOLog, events.EventEmitter);

/**
 *destroyAllNow
 */
UPSSOLog.prototype.destroyAllNow = function(){
    var _self = this;
    this.pool.drain(function(){
        _self.pool.destroyAllNow();
    });
}
