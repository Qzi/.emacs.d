/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-1-29
 * Time: 下午3:05
 * To change this template use File | Settings | File Templates.
 */
var _ = require('underscore');
var ssoEvents = require(__dirname + '/sso_service_controller_events.js').SSO_EVENTS;

var customerServicePhone = '4008-856-168';
var err_dict = {
  up_common:{},
  up_client:{},
  up_server:{}
};

_.extend(err_dict.up_common,
  _.object([
    ssoEvents.COMMON.ERR_IU_IP_NOT_ALLOW,
    ssoEvents.COMMON.ERR_PARAMETER_EMPTY,
    ssoEvents.LOGIN.ERR,
    ssoEvents.LOGIN.ERR_WRONG_PWD,
    ssoEvents.LOGIN.ERR_INPUT_EMPTY,
    ssoEvents.LOGIN.ERR_UID_PWD_EMPTY,
    ssoEvents.LOGOUT.ERR_TOKEN_EMPTY,
    ssoEvents.HB.ERR,
    ssoEvents.HB.ERR_INPUT_TOKEN_EMPTY,
    ssoEvents.TOKEN_LOGIN.ERR,
    ssoEvents.GET_USER_INFO.ERR,
    ssoEvents.GET_USER_INFO.ERR_UID_NOT_EXISTS,
    ssoEvents.GET_USER_INFO.ERR_INPUT_UID_EMPTY,
    ssoEvents.GET_TOKEN_INFO.ERR,
    ssoEvents.GET_TOKEN_INFO.ERR_TOKEN_NOT_EXISTS,
    ssoEvents.GET_TOKEN_INFO.ERR_INPUT_TOKEN_EMPTY
  ], [
    '登录失败！此帐号登录被限制！',
    'URL参数错误',
    '登录: 内部错误, 请联系客服：' + customerServicePhone,
    '登录: 密码错误, 请检查大小写是否被锁定.',
    '登录: 输入参数不能为空.',
    '登录: 用户名或密码不能为空.',
    '注销: token不能为空',
    '心跳: 内部错误, 请联系客服: ' + customerServicePhone,
    '心跳: token不能为空',
    'token登录: 内部错误, 请联系客服: ' + customerServicePhone,
    'GUI内部错误, 请联系客服: ' + customerServicePhone,
    '用户不存在',
    '输入的用户ID为空',
    'GTI内部错误, 请联系客服: ' + customerServicePhone,
    '您的帐号已经在另外的地方登录.',
    '错误: token不能为空'
  ])
);

err_dict.up_client = err_dict.up_common;
err_dict.up_server = err_dict.up_common;

exports.ErrorDict = err_dict;