/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-1-24
 * Time: 上午4:23
 * To change this template use File | Settings | File Templates.
 *
 * 工具类
 */


/** underscore     */
var _ = require("underscore")
/** libxmljs       */
    ,libxmljs = require("libxmljs");
/**crc 废弃
    ,crc =  require("crc")*/

exports.upUtils = {
//var upUtils = {
    /**
     * 截取中文
     */
    subStringToBtyes : function(source, len){
        if(!source || !len)
            return "";
        var c= 0,f= 0,d='';
        for(f=0;f<source.length;f++){
            if(source.charCodeAt(f) > 255){
                if(c==(len-1))len++;
                c+=2;
            }else{
                c++;
            }
            if(c>len)return d;
            d+=source.charAt(f);
        }
        return source;
    },
    errorNdoe :[
        "输入的用户名为空!",
        "用户名不存在!",
        "用户名密码不匹配!",
        "账号已过期!",
        "非法请求!",
        "客户端需要升级!",
        "用户不在线!"
    ],
    /**
     * 根据errortype返回xml object
     * @param errorType   -1，0，1，2，3，4 对应errornode
     * @param userInfo    json
     */
    getXMLObj : function(errorType, userInfo, userName){
        var doc = new  libxmljs.Document();
        var root = doc.node("auth");
        if(errorType > -1){
            root.node("result","0");
            root.node("reason",this.errorNdoe[errorType]);
        }else if(errorType == -2){
            root.node("reason","exit success");
        }else{//未出现错误,返回用户信息
            root.node("result","1");
            root.node("name",userName); //username
            root.node("lvl","9"); //写死9
            root.node("online",userInfo.token);//token
            root.node("id",userName);  //username
            root.node("mobile","1"); //写死为1
            root.node("info",this.formatRight(userInfo.rights));//rights
            root.node("customid",userInfo.cid);//customer_id
            root.node("usertype",userInfo.ut); //用户类型
        }
        return doc.toString();
    },
    /**
     * 权限格式化
     * @param rights
     */
    formatRight : function(rights){
        if(_.isEmpty(rights)) return "";
        //var rightsObj = JSON.parse(rights);
        var rightsObj = rights;
        var rightsStr=[];
        for(var i=0;i<rightsObj.length;i++){
            rightsStr.push([rightsObj[i].mid,rightsObj[i].end_date].join(","));
        }
        return rightsStr.join("|");
    },
    /**
     * crc 校验
     * @param crcNum
     * @param source
     */
    checkCRC:function(crcNum , source){
        //return _.isEqual(crc.crc32(source).toString(),crcNum);
        return _.isEqual(crc32(source).toString(),crcNum);
    }

};

var crc32 = (function() {
    function utf8encode(str) {
        var utf8CharCodes = [];

        for (var i = 0, len = str.length, c; i < len; ++i) {
            c = str.charCodeAt(i);
            if (c < 128) {
                utf8CharCodes.push(c);
            } else if (c < 2048) {
                utf8CharCodes.push((c >> 6) | 192, (c & 63) | 128);
            } else {
                utf8CharCodes.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
            }
        }
        return utf8CharCodes;
    }

    var cachedCrcTable = null;

    function buildCRCTable() {
        var table = [];
        for (var i = 0, j, crc; i < 256; ++i) {
            crc = i;
            j = 8;
            while (j--) {
                if ((crc & 1) == 1) {
                    crc = (crc >>> 1) ^ 0xEDB88320;
                } else {
                    crc >>>= 1;
                }
            }
            table[i] = crc >>> 0;
        }
        return table;
    }

    function getCrcTable() {
        if (!cachedCrcTable) {
            cachedCrcTable = buildCRCTable();
        }
        return cachedCrcTable;
    }

    return function(str) {
        var utf8CharCodes = utf8encode(str), crc = -1, crcTable = getCrcTable();
        for (var i = 0, len = utf8CharCodes.length, y; i < len; ++i) {
            y = (crc ^ utf8CharCodes[i]) & 0xFF;
            crc = (crc >>> 8) ^ crcTable[y];
        }
        return (crc ^ -1) >>> 0;
    };
})();
/**
var userTmp ={
    cid : "60004",
    pwd : "5f900445da139983d9fb030819948540",
    reg_time : "1359353418.873",
    ut : "1",
    cer_time : "0",
    rights:'[{"mid" : "1","end_date" : "2012-12-13"},{"mid" : "2","end_date" : "2012-12-13"}]',
    mt : "",
    bp :""
};
console.log(upUtils.getXMLObj(-1,userTmp,"hanqingnan"));

console.log(upUtils.checkCRC('1399433235',"cmd=login&encodetype=1&id=zhanglitest1&pwd=96e79218965eb72c92a549dd5a330112&mac=5604A6B40BFE&cpu=000206A7h&diskid=&campainid=33&phone=&opt=&exemd5=&otherinfo="));
 */