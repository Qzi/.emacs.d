/**
 * Created with JetBrains WebStorm.
 * User: huangtianshu
 * Date: 13-2-8
 * Time: 上午11:24
 * To change this template use File | Settings | File Templates.
 */
var crypto = require('crypto');
//var fs = require('fs');
var moment = require('moment');
var _ = require('underscore');
var uids = ['temp5', 'temp6'];

var fnGenNewUserData = function(){
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      cid:fnGenRandomString(6),
      pwd:fnGenRandomString(32),
      reg_time:moment().unix(),
      ut:fnGenRandomNumString(2),
      cer_time:moment().unix(),
      rights:fnGenRightsData(4),
      mt:fnGenMtData(2),
      bp:fnGenBpData(2)
    });
  });
  return arrUsers;
};

// 生成新增用户接口数据(随机)
var fnGenNewUserDataRandom = function (numItems) {
  numItems = numItems <= 0 ? 1 : numItems;
  numItems = numItems > 10 ? 10 : numItems;
  var arrUsers = [];
  for (var i = 0; i < numItems; i++) {
    arrUsers.push({
      uid:fnGenRandomString(6),
      cid:fnGenRandomString(6),
      pwd:fnGenRandomString(32),
      reg_time:moment().unix(),
      ut:fnGenRandomNumString(2),
      cer_time:moment().unix(),
      rights:fnGenRightsData(4),
      mt:fnGenMtData(2),
      bp:fnGenBpData(2)
    });
  }
  return arrUsers;
};

// 生成用户基本信息更新数据
var fnGenUpdateUserData = function () {
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      pwd:fnGenRandomString(32),
      ut:fnGenRandomNumString(2),
      cer_time:moment().unix()
    });
  });
  return arrUsers;
};

// 生成新增/更改权限数据
var fnGenUpdateRightsData = function () {
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      rights:fnGenRightsData(3)
    });
  });
  return arrUsers;
};

// 生成删除权限数据(接口)
var fnGenDelRightsData = function () {
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      rights:fnGenRightsToDelData(2)
    });
  });
  return arrUsers;
};

// 生成新增/更新会员类型数据
var fnGenUpdateMtData = function () {
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      mt:fnGenMtData(2)
    });
  });
  return arrUsers;
};

// 生成删除会员类型数据
var fnGenDelMtData = function () {
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      mt:fnGenMtToDelData(1)
    });
  });
  return arrUsers;
};

// 生成新增/更新积分数据
var fnGenUpdateBpData = function () {
  var arrUsers = [];
  _.each(uids, function(item){
    arrUsers.push({
      uid:item,
      bp:fnGenBpData(3)
    });
  });
  return arrUsers;
};

// 生成会员类型字典和积分类型字典数据.
var fnGenSyncDictData = function () {
  return {
    mt_dict:[
      {mt_id:'1',mt_name:'silver-butterfly'},
      {mt_id:'2',mt_name:'gold-butterfly'},
      {mt_id:'3',mt_name:'jade-butterfly'}
    ],
    bpt_dict:[
      {bpt_id:'1',bpt_name:'gold'},
      {bpt_id:'2',bpt_name:'score'},
      {bpt_id:'3',bpt_name:'credit'}
    ]
  };
};

// 生成权限数据
var fnGenRightsData = function (numItems) {
  numItems = numItems <= 0 ? 1 : numItems;
  numItems = numItems > 10 ? 10 : numItems;
  var arrRights = [];

  for (var i = 0; i < numItems; i++) {
    arrRights.push({
      mid:fnGenRandomNumString(3),
      end_date:moment().unix()
    });
  }

  return arrRights;
};

// 生成删除权限数据
var fnGenRightsToDelData = function (numItems) {
  numItems = numItems <= 0 ? 1 : numItems;
  numItems = numItems > 10 ? 10 : numItems;
  var arrRights2Del = [];

  for (var i = 0; i < numItems; i++) {
    arrRights2Del.push(fnGenRandomNumString(3));
  }

  return arrRights2Del;
};

// 生成会员类型数据
var fnGenMtData = function (numItems) {
  numItems = numItems <= 0 ? 1 : numItems;
  numItems = numItems > 10 ? 10 : numItems;
  var arrMt = [];

  for (var i = 0; i < numItems; i++) {
    arrMt.push({
      mt_id:fnGenRandomNumString(3),
      end_date:moment().unix()
    });
  }

  return arrMt;
};

// 生成删除会员类型数据
var fnGenMtToDelData = function (numItems) {
  numItems = numItems <= 0 ? 1 : numItems;
  numItems = numItems > 10 ? 10 : numItems;
  var arrMt2Del = [];

  for (var i = 0; i < numItems; i++) {
    arrMt2Del.push(fnGenRandomNumString(3));
  }

  return arrMt2Del;
};

// 生成积分数据
var fnGenBpData = function (numItems) {
  numItems = numItems <= 0 ? 1 : numItems;
  numItems = numItems > 10 ? 10 : numItems;
  var arrBp = [];

  for (var i = 0; i < numItems; i++) {
    arrBp.push({
      bpt_id:fnGenRandomNumString(3),
      amount:fnGenRandomNumString(3000)
    });
  }

  return arrBp;
};

// 生成随机字符串
var fnGenRandomString = function (numLength) {
  var buf = crypto.randomBytes(numLength/2);
  return buf.toString('hex');
};

// 生成随机数字
var fnGenRandomNumString = function (numMax) {
  return _.random(0, numMax).toString();
};

exports.fnGenNewUserData = fnGenNewUserData;
exports.fnGenNewUserDataRandom = fnGenNewUserDataRandom;
exports.fnGenUpdateUserData = fnGenUpdateUserData;
exports.fnGenUpdateRightsData = fnGenUpdateRightsData;
exports.fnGenDelRightsData = fnGenDelRightsData;
exports.fnGenUpdateMtData = fnGenUpdateMtData;
exports.fnGenDelMtData = fnGenDelMtData;
exports.fnGenUpdateBpData = fnGenUpdateBpData;
exports.fnGenSyncDictData = fnGenSyncDictData;