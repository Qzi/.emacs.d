/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-31
 * Time: 下午4:02
 * To change this template use File | Settings | File Templates.
 */

var poolModule = require('generic-pool'),
  redis = require('redis'),
  config = require(__dirname + '/config.json');

//redis.debug_mode = true;

var redis_pool = poolModule.Pool({

  name:'redis',

  create:function (callback) {

    var c = redis.createClient(
      config.redis.port,
      config.redis.host
    );

    c.on('ready', function(){
      // parameter order: err, resource
      // new in 1.0.6
      process.nextTick(function () {
        callback(null, c);
      });
    });

    c.on('error', function(err){
      process.nextTick(function () {
        callback(err, c);
      });
    });

  },

  destroy:function (client) {
    client.quit();
  },

  max:64,
  // optional. if you set this, make sure to drain() (see step 3)
  min:16,
  // specifies how long a resource can stay idle in pool before being removed
  idleTimeoutMillis:300000,
  // if true, logs via console.log - can also be a function
  log:false
});

exports.RedisPool = redis_pool;