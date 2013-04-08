/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-24
 * Time: 下午4:39
 * To change this template use File | Settings | File Templates.
 */
var request = require('supertest');
var should = require('should');
var querystring = require('querystring');
var us = require('up_security');
var async = require('async');
var loginData = require(__dirname + '/data/login_data.json');

var basUrlDict = {
  'local':'http://localhost:52561',
  'production':'http://api.upchina.com',
  'TE_240_110':'http://192.168.240.110:52561'
};

var currentBaseUrl = basUrlDict.local;
var clientId = 'up_client';
var token = '';
request = request(currentBaseUrl);

console.log('Current Base URL: %s', currentBaseUrl);

async.series([

  function (callback) {
    describe('用户名密码登录', function(){

        it('post: /sso/uv/', function (done) {
          var postBody = us.generateEncryptedParams(loginData, clientId);
          console.log(postBody);
          request
            .post('/sso/uv/')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send(postBody)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                console.dir(err);
                callback(err);
                return;
              }
              var objResult = querystring.parse(res.text);
              objResult.param = objResult.param.replace(/ /g, '+');
              objResult.sign = objResult.sign.replace(/ /g, '+');

              console.log('\nresult from server:');
              console.dir(objResult);

              var accessKey = us.getAccessKey(objResult.clientId);
              var objDecrypted = JSON.parse(us.decryptWithDes(objResult.param, accessKey));
              var strSign = us.signWithHmacMd5(objResult.param, accessKey);


              console.log('\nDecrypted Data:');
              console.dir(objDecrypted);
              console.log('\nstrSign: %s\nsignFromServer: %s', strSign, objResult.sign);
              token = objDecrypted.token;
              console.log('\ngot token: %s', token);
              done();
              callback(null);
            });
        });

    });
  },

  function (callback) {
    describe('心跳', function () {

      it('get: /sso/clientId/' + clientId + '/tk/' + token + '/hb/', function (done) {
        request
          .get('/sso/clientId/' + clientId + '/tk/' + token + '/hb/')
//          .get('/sso/clientId/up_client/tk/54ac8090-7cf1-11e2-991c-1ddf465920c8/hb/')
          .set('Accept', 'application/x-www-form-urlencoded')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              console.dir(err);
              callback(err);
              return;
            }
            var objResult = querystring.parse(res.text);
            objResult.param = objResult.param.replace(/ /g, '+');
            objResult.sign = objResult.sign.replace(/ /g, '+');

            console.log('\nresult from server:');
            console.dir(objResult);

            var accessKey = us.getAccessKey(objResult.clientId);
            var objDecrypted = JSON.parse(us.decryptWithDes(objResult.param, accessKey));
            var strSign = us.signWithHmacMd5(objResult.param, accessKey);


            console.log('\nDecrypted Data:');
            console.dir(objDecrypted);
            console.log('\nstrSign: %s\nsignFromServer: %s', strSign, objResult.sign);

            done();
            callback(null);
          });
      });

    });
  },

  function (callback) {
    describe('Token登录', function(){
      it('get: /sso/clientId/' + clientId + '/tk/' + token + '/info/', function (done) {
        request
          .get('/sso/clientId/' + clientId + '/tk/' + token + '/info/')
          .set('Accept', 'application/x-www-form-urlencoded')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              console.dir(err);
              callback(err);
              return;
            }
            var objResult = querystring.parse(res.text);
            objResult.param = objResult.param.replace(/ /g, '+');
            objResult.sign = objResult.sign.replace(/ /g, '+');

            console.log('\nresult from server:');
            console.dir(objResult);

            var accessKey = us.getAccessKey(objResult.clientId);
            var objDecrypted = JSON.parse(us.decryptWithDes(objResult.param, accessKey));
            var strSign = us.signWithHmacMd5(objResult.param, accessKey);


            console.log('\nDecrypted Data:');
            console.dir(objDecrypted);
            console.log('\nstrSign: %s\nsignFromServer: %s', strSign, objResult.sign);

            callback(null);
            done();
          });
      });
    });
  },

  function (callback) {
    describe.skip('注销(登出)', function(){
      it('delete: /sso/clientId/' + clientId + '/tk/' + token + '/', function (done) {
        request
          .del('/sso/clientId/' + clientId + '/tk/' + token + '/')
          .set('Content-length', '0')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              console.dir(err);
              callback(err);
              return;
            }
            var objResult = querystring.parse(res.text);
            objResult.param = objResult.param.replace(/ /g, '+');
            objResult.sign = objResult.sign.replace(/ /g, '+');

            console.log('\nresult from server:');
            console.dir(objResult);

            var accessKey = us.getAccessKey(objResult.clientId);
            var objDecrypted = JSON.parse(us.decryptWithDes(objResult.param, accessKey));
            var strSign = us.signWithHmacMd5(objResult.param, accessKey);

            console.log('\nDecrypted Data:');
            console.dir(objDecrypted);
            console.log('\nstrSign: %s\nsignFromServer: %s', strSign, objResult.sign);

            done();
            callback(null);
          });
      });
    });
  }
]);
