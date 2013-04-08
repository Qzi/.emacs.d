/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-30
 * Time: 下午12:53
 * To change this template use File | Settings | File Templates.
 */

var _ = require('underscore'),
  us = require(__dirname+'/up_security.js');

/*
* # 功能: 将数据加密,并返回upchina所需的 param=xxxx&sign=xxxx&clientId=xxx 形式
* # 输入参数:
*   - aData: 需加密的对象
*   - aClientId: client id
* # 返回值:
*   - 正常情况下返回字符串
*   - 异常情况下返回null
* */
exports.generateEncryptedParams = function (aData, aClientId) {
  var strData = JSON.stringify(aData);
  var strAccessKey = us.getAccessKey(aClientId);
  if (!_.isNull(strAccessKey)) {
    var strDes = us.encryptWithDes(strData, strAccessKey);
    var strSign = us.signWithHmacMd5(strDes, strAccessKey);
    return 'param=' + strDes + '&sign=' + strSign + '&clientId=' + aClientId;
    //  return qs.stringify({param:strDes, sign:strSign, clientId:aClientId});
  }
  else {
    return null;
  }
}