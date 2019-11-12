/*
* 测试json跟二进制协议
 调用服务器代码，测试代码是否正常
* date: 2018-01-22
*/

var log = require('../utils/log.js');
var netbus = require('../netbus/netbus.js');
var proto_man = require('../netbus/proto_man.js');

//json编码和解码
var data = {
	uname: 'elviscui',
	upwd: '123456'
};
var buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 1, 12, data);
log.info(buf);//接送协议编码好的
log.warn('json length =', buf.length);

var cmd = proto_man.decode_cmd(proto_man.PROTO_JSON, buf);
log.info(cmd);//{0: 1, 1: 12, 2: "Helloworld!" }
//end

//测试二进制协议
function encode_cmd_1_12(body){
	var stype = 1;
	var ctype = 12;

	var total_len = 2 + 2 + body.uname.length + body.upwd.length + 2 + 2;
	var buffer = Buffer.allocUnsafe(total_len);
	buffer.writeUInt16LE(stype, 0);//0,1
	buffer.writeUInt16LE(ctype, 2);//2,3
	//uname的字符串
	buffer.writeUInt16LE(body.uname.length, 4);//4,5
	buffer.write(body.uname, 6);//从6开始写入uname长度的字符串
	//upwd的数据
	var offset = 6 + body.uname.length;
	buffer.writeUInt16LE(body.upwd.length, offset);//offset + 0, offset + 1
	buffer.write(body.upwd, offset + 2);//从offset2 + 2开始写入upwd的字符串
	return buffer;
}

function decode_cmd_1_12(cmd_buf){
	var stype = 1;
	var ctype = 12;

	//获取uname
	var uname_len = cmd_buf.readUInt16LE(4);
	if(uname_len + 2 + 2 + 2 > cmd_buf.length){
		return null;
	}
	var uname = cmd_buf.toString("utf8", 2 + 2 + 2, 2 + 2 + 2 + uname_len);
	log.info('uname = ', uname, uname_len);
	if(!uname){
		return null;
	}

	var offset = 6 + uname_len;
	//获取upwd
	var upwd_len = cmd_buf.readUInt16LE(offset);
	if((offset + upwd_len + 2) > cmd_buf.length){
		return null;
	}
	var upwd = cmd_buf.toString('utf8', offset + 2, offset + 2 + upwd_len);
	log.info('upwd = ', upwd, upwd_len);

	var cmd = {
		0: stype,
		1: ctype,
		2: {
			'uname': uname,
			'upwd': upwd
		}
	};
	return cmd;
}

proto_man.reg_buf_encoder(1, 12, encode_cmd_1_12);
proto_man.reg_buf_decoder(1, 12, decode_cmd_1_12);


var buf_test2 = proto_man.encode_cmd(proto_man.PROTO_BUF, 1, 12, data);
log.info('buf_test2 ', buf_test2);
log.warn('buf_test2 length ', buf_test2.length);

var cmd_buf_test2 = proto_man.decode_cmd(proto_man.PROTO_BUF, buf_test2);
log.info('cmd_buf_test2 ', cmd_buf_test2);

