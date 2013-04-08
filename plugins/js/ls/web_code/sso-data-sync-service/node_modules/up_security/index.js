var ups = require(__dirname + '/up_security.js'),
  helper = require(__dirname + '/helpers.js'),
  upd = require(__dirname + '/up_decrypt_middleware_for_express.js');

exports.up_security = ups;
exports.up_decrypt_middleware_for_express = upd.up_security_process;
exports.getAccessKey = ups.getAccessKey;
exports.hashWithMD5 = ups.hashWithMD5;
exports.signWithHmacMd5 = ups.signWithHmacMd5;
exports.encryptWithDes = ups.encryptWithDes;
exports.decryptWithDes = ups.decryptWithDes;
exports.generateEncryptedParams = helper.generateEncryptedParams;