/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-9
 * Time: 下午3:42
 * To change this template use File | Settings | File Templates.
 */

var ssodm = require('../sso_data_manager_redis.js');

describe('SSO Data Manager', function(){
  var conn = null;
  beforeEach(function(done){
    conn = ssodm.createConnection();
    conn.on('ready', function(){
      done();
    });
  });

  afterEach(function(done){
    conn.on('end', function(){
      done();
    });
    conn.closeManager();
  });

  describe('全局数据字典同步', function(){
    it('syncDict: 当同步成功后,会发送 dict_sync_ok 事件', function (done) {
      conn.on('dict_sync_ok', function () {
        done();
      });
      var dict_data = require('./test_data/dict_data.json');
      conn.syncDict(dict_data);
    });
  });

  describe('新增用户', function(){
    it('addNewUsers: 成功添加用户后,会发送 add_new_users_ok 事件', function(done){
      conn.on('add_new_users_ok', function(){
        done();
      });
      var newUserData = require('./test_data/add_new_users.json');
      conn.addNewUsers(newUserData);
    });
  });

  describe.skip('权限相关接口', function(){
    it('updateRights: 更新/添加权限成功后,会发送 update_rights_ok 事件', function(done){
      conn.on('update_rights_ok', function(){
        done();
      });
      var update_rights_data = require('./test_data/update_rights.json');
      conn.updateRights(update_rights_data);
    });

    it('deleteRights: 删除权限成功后,会发送delete_rights_ok事件', function(done){
      conn.on('delete_rights_ok', function(){
        done();
      });
      var delete_rights_data = require('./test_data/delete_rights.json');
      conn.deleteRights(delete_rights_data);
    });
  });

  describe.skip('会员类型相关接口', function(){
    it('updateMemberTypes: 更新用户的会员类型后,会发送update_member_type_ok事件', function(done){
      conn.on('update_member_type_ok', function(){
        done();
      });
      var update_mt_data = require('./test_data/update_member_type.json');
      conn.updateMemberTypes(update_mt_data);
    });

    it('deleteMemberTypes: 删除某用户的会员类型后,会发送delete_member_type_ok事件', function(done){
      conn.on('delete_member_type_ok', function(){
        done();
      });
      var delete_mt_data = require('./test_data/delete_mt.json');
      conn.deleteMemberTypes(delete_mt_data);
    });
  });

  describe.skip('积分相关接口', function(){
    it('updateBonusPoint: 更新用户积分后,会发送update_bonus_point_ok事件', function(done){
      conn.on('update_bonus_point_ok', function(){
        done();
      });
      var update_bp_data = require('./test_data/update_bp.json');
      conn.updateBonusPoint(update_bp_data);
    });
  });

  describe.skip('SSODataManagerRedis Method Test', function(){

//    it('createConnection: 当和Redis的连接建立成功后,会发送ready事件.', function(done){
//      conn = ssodm.createConnection();
//      conn.on('ready', function(){
//        done();
//      });
//    });
  });
});
