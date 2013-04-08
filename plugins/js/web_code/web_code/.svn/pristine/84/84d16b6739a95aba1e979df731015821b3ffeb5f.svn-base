#! /usr/bin/env node

//var util = require('util');
var request = require('supertest');
var ups = require('up_security');
var querystring = require('querystring');
var async = require('async');
var _ = require('underscore');
var opti = require('optimist');
//var fs = require('fs');
var loginData = require(__dirname + '/data/login_data.json')['hanqingnan'];

var baseUrls = {
  'localhost':'http://localhost:52561',
  'production':'http://api.upchina.com',
  'n103':'http://192.168.240.103:52561',
  'n113':'http://192.168.240.113:52561',
  's108':'http://192.168.242.108:52561',
  's109':'http://192.168.242.109:52561',
  'n110':'http://192.168.240.110:52561',
  's211':'http://192.168.242.211:52561',
  'test':'http://test.upchina.com'
};

var describeForArgvS = 'select a server: [';
var arrForArgvS = [];
_.each(baseUrls, function(value,key){
  arrForArgvS.push(key);
});
describeForArgvS += arrForArgvS.join(',')+']';

var argv = opti
  .options('s', {
    default: 'production',
    alias: 'server',
    describe: describeForArgvS
  })
  .options('i', {
    default: 10,
    alias: 'interval',
    describe: 'heart beat interval, in second.'
  })
  .options('c', {
    default: 'up_client',
    alias: 'clientId',
    describe: 'clientId, [up_client, up_server]'
  })
  .options('h', {
    default: false,
    alias: 'help',
    describe: 'this message'
  })
  .argv;

if (argv.i < 3 || argv.i > 120) {
  console.log('3 <= interval <= 120 ');
  process.exit(0);
}

if (argv.h) {
  opti.showHelp();
  process.exit(0);
}

var currentUrl = '';
if (!_.has(baseUrls, argv.s)) {
  currentUrl = baseUrls.production;
}
else {
  currentUrl = baseUrls[argv.s];
}

request = request(currentUrl);
var userAgent = 'sso-cli/1.0 via Node.js';
var clientId = argv.c;
var token = '';
var heartbeatIntervalInSecond = argv.i;
var heartbeatIntervalInMs = heartbeatIntervalInSecond * 1000;
var cntHB = 0;

function startHb() {
  cntHB++;

  async.series([

    function (callback) {
      request
        .get('/sso/clientId/' + clientId + '/tk/' + token + '/hb/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .set('User-Agent', userAgent)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            console.dir(err);
            return;
          }
          var objResult = querystring.parse(res.text);
          objResult.param = objResult.param.replace(/ /g, '+');
          objResult.sign = objResult.sign.replace(/ /g, '+');

          var accessKey = ups.getAccessKey(objResult.clientId);
          var objDecrypted = JSON.parse(ups.decryptWithDes(objResult.param, accessKey));
//      var strSign = ups.signWithHmacMd5(objResult.param, accessKey);

          console.log('Heartbeat response from server(%s) - result: %s, length: %d',
            currentUrl,
            objDecrypted.result,
            JSON.stringify(objDecrypted).length);
          console.dir(objDecrypted);
          console.log('-----------------------------------------------------------------------');
          callback(null);
        });
    },

    function (callback) {
      request
        .get('/sso/clientId/' + clientId + '/tk/' + token + '/info/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .set('User-Agent', userAgent)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            console.dir(err);
            return;
          }
          var objResult = querystring.parse(res.text);
          objResult.param = objResult.param.replace(/ /g, '+');
          objResult.sign = objResult.sign.replace(/ /g, '+');

          var accessKey = ups.getAccessKey(objResult.clientId);
          var objDecrypted = JSON.parse(ups.decryptWithDes(objResult.param, accessKey));
//      var strSign = ups.signWithHmacMd5(objResult.param, accessKey);

          console.log('token login response from server(%s) - result: %s, length: %d',
            currentUrl,
            objDecrypted.result,
            JSON.stringify(objDecrypted).length);
          console.dir(objDecrypted);
          console.log('-----------------------------------------------------------------------');
          callback(null);
        });
    }
  ],
    function (err) {
      if (!err) {
        console.log('No.%d HeartBeat, Sleep for %d seconds', cntHB, heartbeatIntervalInSecond);
        console.log('=======================================================================');
        setTimeout(startHb, heartbeatIntervalInMs);
      }
      else {
        console.dir(err);
        console.log('=======================================================================');
      }
    });
}

function startLogin() {
  var postBody = ups.generateEncryptedParams(loginData, clientId);
  request
    .post('/sso/uv2/')
    .set('Accept', 'application/x-www-form-urlencoded')
    .set('User-Agent', userAgent)
    .send(postBody)
    .expect(200)
    .end(function (err, res) {
      if (err) {
        console.dir(err);
        return;
      }
      var objResult = querystring.parse(res.text);
      objResult.param = objResult.param.replace(/ /g, '+');
      objResult.sign = objResult.sign.replace(/ /g, '+');

      var accessKey = ups.getAccessKey(objResult.clientId);
      var objDecrypted = JSON.parse(ups.decryptWithDes(objResult.param, accessKey));
//    var strSign = ups.signWithHmacMd5(objResult.param, accessKey);


      if (objDecrypted.result) {
        token = objDecrypted.token;
        console.log('\ngot token: %s', token);
        console.log('Login response from server(%s) - result: %s, length: %d',
          currentUrl,
          objDecrypted.result,
          JSON.stringify(objDecrypted).length);
        console.dir(objDecrypted);
        console.log('=======================================================================');
//      fs.writeFileSync('./addrtest3.xml', objDecrypted.addr, 'base64');
        console.log('Login successful! start heartbeat...');
        process.nextTick(startHb);
      }
      else {
        console.log('login failed.');
        console.dir(objDecrypted);
      }
    });
}

console.log('Current Base URL: %s\nclientId: %s\nheartbeat interval: %ds',
  currentUrl, clientId, heartbeatIntervalInSecond);
console.log('User Info: %j', loginData);

startLogin();

process.on('SIGINT', function () {
  console.log("\nShutting down...");
  process.exit(0);
});

process.on('uncaughtException', function (err) {
  console.log('Uncaught Exception: %j', err);
  process.exit(0);
});

process.on('exit', function () {
  console.log('Exiting hearbeat test...');
});