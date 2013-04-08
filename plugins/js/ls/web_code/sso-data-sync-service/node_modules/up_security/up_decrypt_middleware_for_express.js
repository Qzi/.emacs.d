/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-17
 * Time: 下午5:53
 * To change this template use File | Settings | File Templates.
 */
// up rest express 服务解密中间件
var util = require('util'),
  _ = require('underscore'),
  winston = require('winston'),
  error_dict = require(__dirname + '/error_dict.json'),
  us = require(__dirname + '/up_security.js');

var logger = new (winston.Logger)({
  transports:[
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename:'./log/up_decrypt_middleware_for_express.log',
      maxsize:10485760,
      maxFiles:5
    })
  ]
});

/*
 * - 输入: req.up_params
 * - 输出:
 *   - 成功
 *     - req.up_params.isDecryptionOK: true
 *     - req.up_params.decryptedParam: 包含了解密后的json对象
 *   - 错误
 *     - req.up_params.isDecryptionOK: false
 *     - req.up_params.errResult: 包含了错误数据的对象.
 * */
exports.up_security_process = function (req, res, next) {

  if (_.isEmpty(req.up_params)) {
    req.up_params = req.body;
  }

  var strParamEncrypted = req.up_params.param;
  var strSign = req.up_params.sign;
  var strClientId = req.up_params.clientId;

  // 非空检查
  if (_.isEmpty(strParamEncrypted) || _.isEmpty(strSign) || _.isEmpty(strClientId)) {
    logger.error('up_security_process: parameters empty');
    req.up_params.isDecryptionOK = false;
    req.up_params.errResult = {
      "result":false,
      "err_code":error_dict.empty_parameters.err_code,
      "err_msg":error_dict.empty_parameters.err_msg
    };
    next();
    return;
  }

  // 类型检查
  if (!_.isString(strParamEncrypted) || !_.isString(strSign) || !_.isString(strClientId)) {
    logger.error('up_security_process: data type error,not String');
    req.up_params.isDecryptionOK = false;
    req.up_params.errResult = {
      "result":false,
      "err_code":error_dict.invalid_params_data.err_code,
      "err_msg":util.format('%s: param=%s, sign=%s, clientId=%s',
        error_dict.invalid_params_data.err_msg,
        strParamEncrypted,
        strSign,
        strClientId)
    };
    next();
    return;
  }

  // 如果传过来的base64字符串中级有空格,需要转换成+号
  strParamEncrypted = strParamEncrypted.replace(/ /g, '+');
  strSign = strSign.replace(/ /g, '+');

  // 判断clientId是否有效
  var strAccessKey = us.getAccessKey(strClientId);
  if (_.isNull(strAccessKey)) {
    logger.error('up_security_process: clientId\'s accessKey is empty', {"meta":strClientId});
    req.up_params.isDecryptionOK = false;
    req.up_params.errResult = {
      "result":false,
      "err_code":error_dict.invalid_client_id.err_code,
      "err_msg":error_dict.invalid_client_id.err_msg
    };
    next();
    return;
  }

  // 检查sign的正确性 ===================================================
  var strSignFromServer = '';
  try {
    strSignFromServer = us.signWithHmacMd5(strParamEncrypted, strAccessKey);
  } catch (e) {
    req.up_params.isDecryptionOK = false;
    req.up_params.errResult = {
      "result":false,
      "err_code":error_dict.hmacmd5_failed.err_code,
      "err_msg":error_dict.hmacmd5_failed.err_msg + JSON.stringify(e)
    };
    next();
    return;
  }

  if (!_.isEqual(strSign, strSignFromServer)) {
    logger.warn('up_security_process: Sign error', {"meta":{"sign":strSign, "signFromServer":strSignFromServer}});
    req.up_params.isDecryptionOK = false;
    req.up_params.errResult = {
      "result":false,
      "err_code":error_dict.invalid_sign.err_code,
      "err_msg":error_dict.invalid_sign.err_msg
    };
    next();
    return;
  }

  // 解密param的内容 ===================================================
  var strDecryptedParam = '';
  try {
    strDecryptedParam = us.decryptWithDes(strParamEncrypted, strAccessKey);
  } catch (e) {
    if (e instanceof TypeError) {
      req.up_params.isDecryptionOK = false;
      req.up_params.errResult = {
        "result":false,
        "err_code":error_dict.decipher_failed.err_code,
        "err_msg":error_dict.decipher_failed.err_msg + JSON.stringify(e)
      };
      next();
      return;
    }
  }

  var objParamJson = null;
  try {
    objParamJson = JSON.parse(strDecryptedParam);
  }
  catch (e) {
    if (e instanceof SyntaxError) {
      logger.error('up_security_process: json parse error.', {"meta":strDecryptedParam});
      req.up_params.isDecryptionOK = false;
      req.up_params.errResult = {
        "result":false,
        "err_code":error_dict.json_syntax_error.err_code,
        "err_msg":error_dict.json_syntax_error.err_msg + JSON.stringify(e)
      };
      next();
      return;
    }
  }

  req.up_params.isDecryptionOK = true;
  req.up_params.decryptedParam = objParamJson;
//  logger.debug('req.up_params.decryptedParam', req.up_params.decryptedParam);
  next();
};