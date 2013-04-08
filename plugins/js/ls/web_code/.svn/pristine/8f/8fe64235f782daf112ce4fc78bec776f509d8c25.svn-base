/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-28
 * Time: 下午3:45
 * To change this template use File | Settings | File Templates.
 */

var winston = require('winston');

/*
* aOptions: {
    filename: aFilePath,
    maxsize:10485760,
    maxFiles:5
  }
* */
exports.getLogger = function (aOptions) {
  return new (winston.Logger)({
    transports:[
      new (winston.transports.Console)(),
      new (winston.transports.File)(aOptions)
    ]
  });
};