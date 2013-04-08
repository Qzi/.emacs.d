/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-24
 * Time: 上午10:54
 * To change this template use File | Settings | File Templates.
 */

var sso_events = {

  'COMMON':{ // 通用错误号
    'ERR_IU_IP_NOT_ALLOW':'3001',   // 该ip地址不允许登录,一般仅限内部用户帐号
    'ERR_PARAMETER_EMPTY':'3002'    // 服务器接收到的输入参数为空.
  },

  'LOGIN':{ // 登录错误号
    'ERR':'3010',                   // 服务端异常错误.
    'ERR_WRONG_PWD':'3011',         // 密码错误
    'ERR_INPUT_EMPTY':'3012',       // 登录数据为空
    'ERR_UID_PWD_EMPTY':'3013'      // 服务端接收到uid或密码为空
  },

  'LOGOUT':{  // 登出错误号
    'ERR':'3020',                   // 服务端异常错误.
    'ERR_TOKEN_EMPTY':'3021'        // 服务端接收到的token为空
  },

  'HB':{  // 心跳错误号
    'ERR':'3030',                   // 服务端异常错误.
    'ERR_INPUT_TOKEN_EMPTY':'3031'  // 服务端接收到的token为空
  },

  'TOKEN_LOGIN':{ // token登录
    'ERR':'3040',                   // 服务端异常错误.
    'ERR_INPUT_TOKEN_EMPTY':'3041'  // 服务端接收到的token为空
  },

  'GET_USER_INFO':{ // 读取用户信息错误
    'ERR':'3050',                   // 服务端异常错误
    'ERR_UID_NOT_EXISTS':'3051',    // 用户名不存在
    'ERR_INPUT_UID_EMPTY':'3052'    // 服务端接收到的uid为空
  },

  'GET_TOKEN_INFO':{ // 读取token信息错误
    'ERR':'3060',                   // 服务端异常错误
    'ERR_TOKEN_NOT_EXISTS':'3061',  // token不存在, 用户被踢或token过期
    'ERR_INPUT_TOKEN_EMPTY':'3062'  // 服务端接收到的token为空.
  }

};

exports.SSO_EVENTS = sso_events;