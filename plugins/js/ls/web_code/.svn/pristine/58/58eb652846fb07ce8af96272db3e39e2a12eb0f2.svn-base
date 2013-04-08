var crypto = require('crypto'),
  _ = require('underscore'),
  accessKeysDict = require(__dirname + '/access_keys.json');

exports.getAccessKey = function (aClientId) {

  if (_.has(accessKeysDict, aClientId)) {
    return accessKeysDict[aClientId];
  } else {
    return null;
  }

}

// md5
exports.hashWithMD5 = function (aData) {
  var buffData = new Buffer(aData, 'utf8');
  var hash = crypto.createHash('md5');
  hash.update(buffData);
  var strHashed = hash.digest('hex');
  hash = null;
  return strHashed;
};

// hmac md5签名
exports.signWithHmacMd5 = function (aData, aAccessKey) {

  if (_.isEmpty(aData))
    return null;
  if (_.isEmpty(aAccessKey))
    return null;

  var buffData = new Buffer(aData, 'utf8');
  var buffKey = new Buffer(aAccessKey, 'utf8');

  var hmacMD5 = crypto.createHmac('md5', buffKey);
  hmacMD5.update(buffData);
  var strHmacMD5 = hmacMD5.digest('base64');
  hmacMD5 = null;

  return strHmacMD5;

};

// des加密
exports.encryptWithDes = function (aData, aAccessKey) {

  if (_.isEmpty(aData))
    return null;
  if (_.isEmpty(aAccessKey))
    return null;

  var buffData = new Buffer(aData, 'utf8');
  var buffKey = new Buffer(aAccessKey, 'utf8');
  var buffIV = new Buffer([0x75, 0x70, 0x63, 0x68, 0x69, 0x6e, 0x61, 0x31]);

  var cipher = crypto.createCipheriv('des', buffKey, buffIV);
  var strDes = cipher.update(buffData, 'binary', 'base64');
  strDes += cipher.final('base64');
  cipher = null;

  return strDes;
};

// des解密
exports.decryptWithDes = function (aData, aAccessKey) {

  if (_.isEmpty(aData))
    return null;
  if (_.isEmpty(aAccessKey))
    return null;

  var buffData = new Buffer(aData, 'utf8');
  var buffKey = new Buffer(aAccessKey, 'utf8');
  var buffIV = new Buffer([0x75, 0x70, 0x63, 0x68, 0x69, 0x6e, 0x61, 0x31]);

  var decipher = crypto.createDecipheriv('des', buffKey, buffIV);
  var strDesDecrypted = decipher.update(buffData, 'base64', 'base64');
  strDesDecrypted += decipher.final('base64');
  decipher = null;

  return strDesDecrypted;
};