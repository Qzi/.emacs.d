/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-1
 * Time: 上午5:59
 * To change this template use File | Settings | File Templates.
 */
//pwd:e2834e84b6ad91745b22fcb32fae5096
//username:temp2
//cmd=login&encodetype=1&id=temp2&pwd=e2834e84b6ad91745b22fcb32fae5096&mac=1C4BD62F77BD&cpu=00020655h&diskid=&campainid=28&phone=&opt=&exemd5=&otherinfo=&crc=1959828222
//cmd=unique&id=temp2&online=

//cmd=login&encodetype=1&id=mtest1&pwd=96e79218965eb72c92a549dd5a330112&mac=5404A6B40B87&cpu=000206A7h&diskid=&campainid=28&phone=&opt=&exemd5=&otherinfo=&crc=4248812463
//&crc=754398261

//cmd=login&encodetype=1&id=mtest1&pwd=96e79218965eb72c92a549dd5a330112&mac=5404A6B40B87&cpu=000206A7h&diskid=&campainid=28&phone=&opt=&exemd5=&otherinfo=&crc=4248812463
//cmd=login&encodetype=1&id=zhanglitest1&pwd=96e79218965eb72c92a549dd5a330112&mac=5604A6B40BFE&cpu=000206A7h&diskid=&campainid=33&phone=&opt=&exemd5=&otherinfo=&crc=1399433235
var crc =  require("crc");
var queryString = "cmd=login&encodetype=1&id=zhanglitest1&pwd=96e79218965eb72c92a549dd5a330112&mac=5604A6B40BFE&cpu=000206A7h&diskid=&campainid=33&phone=&opt=&exemd5=&otherinfo=";

console.log(crc.crc32("hello world"));
console.log(crc.crc32(queryString).toString());
console.log(crc.buffer.crc32(new Buffer(queryString)));

console.log(crc.crc32(queryString));



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

console.log(crc32(queryString).toString());