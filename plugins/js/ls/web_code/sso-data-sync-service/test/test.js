/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-8
 * Time: 下午4:39
 * To change this template use File | Settings | File Templates.
 */
var util = require('util'),
  request = require('supertest'),
  should = require('should'),
  qs = require('querystring'),
  ups = require('up_security'),
  testDataGenerator = require(__dirname+'/test_data_generator.js');

var urls = [
  'http://localhost:52560',
  'http://api.upchina.com'
];
request = request(urls[1]);
var clientId = 'up_client';

describe('UP SSO 数据同步接口', function(){

  describe('字典数据同步', function () {
    it('post: /ssodb/dict/', function (done) {
      var dictData = testDataGenerator.fnGenSyncDictData();
      console.log('\nsync dict: request data:\n');
      console.log(util.inspect(dictData, true, 3, true));
      request
        .post('/ssodb/dict/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(dictData, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });
  });

  describe('用户相关', function () {
    it('新增用户: post: /ssodb/users/', function(done){
      var newUserData = testDataGenerator.fnGenNewUserData();
      console.log('\nadd new user: request data:\n');
      console.log(util.inspect(newUserData, true, 3, true));
      request
        .post('/ssodb/users/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(newUserData, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });

    it('修改用户信息: post: /ssodb/users_update/', function(done){
      var updateUserData = testDataGenerator.fnGenUpdateUserData();
      console.log('\nupdate user info: request data:\n');
      console.log(util.inspect(updateUserData, true, 3, true));
      request
        .post('/ssodb/users_update/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(updateUserData, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });
  });


  describe('权限', function () {
    it('新增/更改权限: post: /ssodb/rights/', function(done){
      var updateRight = testDataGenerator.fnGenUpdateRightsData();
      console.log('\nupdate user rights: request data:\n');
      console.log(util.inspect(updateRight, true, 3, true));
      request
        .post('/ssodb/rights/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(updateRight, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });

    it('删除权限: post: /ssodb/rights_trash/', function(done){
      var dataDelRights = testDataGenerator.fnGenDelRightsData();
      console.log('\ndelete user rights: request data:\n');
      console.log(util.inspect(dataDelRights, true, 3, true));
      request
        .post('/ssodb/rights_trash/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(dataDelRights, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });
  });

  describe('会员类型', function () {
    it('新增,更新用户的会员类型: post: /ssodb/mt/', function(done){
      var dataUpdateMt = testDataGenerator.fnGenUpdateMtData();
      console.log('\nupdate user member type: request data:\n');
      console.log(util.inspect(dataUpdateMt, true, 3, true));
      request
        .post('/ssodb/mt/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(dataUpdateMt, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });

    it('删除用户的会员类型: post:/ssodb/mt_trash/', function(done){
      var dataDelMt = testDataGenerator.fnGenDelMtData();
      console.log('\ndelete user member type: request data:\n');
      console.log(util.inspect(dataDelMt, true, 3, true));
      request
        .post('/ssodb/mt_trash/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(dataDelMt, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });
  });

  describe('积分', function () {
    it('用户积分更新(/ssodb/bp/)', function(done){
      var dataUpdateBp = testDataGenerator.fnGenUpdateBpData();
      console.log('\nupdate user bonus point: request data:\n');
      console.log(util.inspect(dataUpdateBp, true, 3, true));
      request
        .post('/ssodb/bp/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(ups.generateEncryptedParams(dataUpdateBp, clientId))
        .expect(200)
        .end(function (err, res) {
          console.dir(res.body);
          done();
        });
    });
  });

  it.skip('测试接口:取用户的数据', function (done) {
    request
      .get('/ssodb/uid/temp')
//      .set('Accept', 'text/plain')
//      .send('uid=feichong')
      .expect(200)
      .end(function (err, res) {
        console.dir(res.body);
        done();
      });
  });

})
