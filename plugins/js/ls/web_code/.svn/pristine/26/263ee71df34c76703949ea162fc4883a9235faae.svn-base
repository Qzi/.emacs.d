/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-11
 * Time: 下午3:09
 * To change this template use File | Settings | File Templates.
 */
var ssodm = require('../sso_data_manager_redis.js');

describe('SSO Data Manager test', function(){

  describe('Method Test', function(){
    var conn = null;
    it('should emit ready when connection established', function(done){
      conn = ssodm.createConnection();
      conn.on('ready', function(){
        done();
      });
    });


    it('should emit add_new_users_ok after addNewUsers method called', function(done){
      conn.on('temp_test_ok', function(){
        done();
      });
      conn.tempTest();
    });


  });
});