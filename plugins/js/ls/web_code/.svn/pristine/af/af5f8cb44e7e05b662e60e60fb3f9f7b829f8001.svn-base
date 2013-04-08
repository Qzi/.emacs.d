/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-2-27
 * Time: 下午6:03
 * To change this template use File | Settings | File Templates.
 */
var uti = require('util');
var netUtil = require('net');
var _ = require('underscore');
var innerUserConfig = require(__dirname+'/inner_users.json');

/*
 * 功能: 检查是否允许访问的内部用户
 * 描述:
 * */
var isUpInnerUser = function (aUID) {
  return _.contains(innerUserConfig.users, aUID);
};

/*
 * 功能: 检查是否允许访问的内部用户
 * 描述:
 * */
var isUpInnerUserIPValid = function (aUID, aIP) {
  // 判断用户是否有效
  if (!isUpInnerUser(aUID))
    return false;

  // IP地址有效性
  if (!netUtil.isIPv4(aIP))
    return false;

  // 判断内网地址
  if (_.isEqual(aIP, '127.0.0.1')) {
    return true;
  }

  var arrIP = aIP.split('.');
  var strPrefixInternal = uti.format('%s.%s', arrIP[0], arrIP[1]);
  var numLastSection = Number(arrIP[3]);

  if (_.isEqual(strPrefixInternal, '192.168')) {
    return true;
  }

  // 判断外网地址
  var strPrefixOut = uti.format('%s.%s.%s', arrIP[0], arrIP[1], arrIP[2]);
  if (_.has(innerUserConfig.ip_out, strPrefixOut)) {
    var objOut = innerUserConfig.ip_out[strPrefixOut];
    var isIPValid = numLastSection >= objOut.min && numLastSection <= objOut.max;
    return isIPValid;
  }
  else {
    return false;
  }
};

exports.isUpInnerUser = isUpInnerUser;
exports.isUpInnerUserIPValid = isUpInnerUserIPValid;

//var testUID = 'na.jiang004';
//var testIP = '114.113.154.191';
//
//console.log('isUpInnerUser:'+isUpInnerUser(testUID));
//console.log('isUpInnerUserIPValid:'+isUpInnerUserIPValid(testUID, testIP));


