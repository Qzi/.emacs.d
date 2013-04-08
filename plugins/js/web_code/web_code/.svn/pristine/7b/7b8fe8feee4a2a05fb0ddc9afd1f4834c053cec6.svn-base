# UP SSO LOG MODULE

## 使用本包
---
只需要将sso\_log\_module目录复制到你的node项目的sso\_log\_module文件夹下即可.

## 本包所依赖的模块的安装
---
	$ cd sso_log_module
	$ npm install

## Example
----

**配置路径:** config/config.json

*mysql 配置文件说明*

	mysql_option    mysql数据库相关配置(数据信息请参考雅婧有邮件--SSO正是库)
	host        mysql数据服务器ip
    port        mysql数据服务器端口
    user        mysql 登陆名
    password    msyql 登陆密码
    database    mysql数据名称(部署时不需要改动)
    charset     字符集(部署时不需要改动)

*rabbitmq 配置文件说明*

    host            rabbitmq server ip(部署时需要根据正式服服务器ip配置，北方192.168.240.117，南方192.168.242.230)
	port            rabbitmq server port(部署时不需要改动)
	login           rabbitmq server username(部署时不需要改动)	password        rabbitmq server password(部署时不需要改动)
	vhost           vhost(部署时不需要改动)
	heartbeat       心跳(部署时不需要改动)
	logExchangeName exchange name
	logQueueName    queue name
	server_option   发送消息配置
	client_option   消费者（部署发送端不需要修改消费者配置）

**rabbitmq 调用示例**

	var rabbitmqLog = require('sso_log_module').SSOLogSendService;
	//初始化日志服务，注意：此操作需要在发送消息之前执行
	rabbitmqLog.init();//此句将会建立一个长连接，直到服务停止
	//发送消息
	process.nextTick(function(){
    	rabbitmqLog.sendLogMsg(json);
	});

**rabbitmq 接收日志**

	forever sso_auth_log/SSOLogReceive.js

**mysql调用示例**

	var mysqlLog = require('sso_log_module').createUPSSOLogFactory();
	var post = {uid:"username",cid:	600004,mac:"",cpu:"",diskid:"",exemd5:"",opt:"",otherinfo:"",actiontype:1,campaignId:28};

*发送记录日志通知*

	process.nextTick(function(){
      upLog.emit("UP_SSO_EVENT_WRITE",post);
	});

