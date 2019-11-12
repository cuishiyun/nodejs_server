/*
* proto协议管理类
* date: 2019-01-22

* 规定:
(1): 服务号和命令号不能为0
(2): 服务号和命令号大小不能超过2个字节的整数 65536
(3): buf协议里2个字节来存放服务号(从0开始的2个字节),命令号(2开始的两个字节)
(4): 加密/解密
(5): 服务号和命令号二进制中都用小尾存储
(6): 所有的文本都使用utf8
*/

// var netbus = require('./netbus.js'); 
var log = require('./../utils/log.js');
var proto_tools = require('./proto_tools.js');

var proto_man = {
	PROTO_JSON: 1,//json协议 
	PROTO_BUF: 2, //二进制协议

	encode_cmd: encode_cmd,
	decode_cmd: decode_cmd,
	reg_decoder: reg_buf_decoder,
	reg_encoder: reg_buf_encoder,

	encrypt_cmd: encrypt_cmd,
	decrypt_cmd: decrypt_cmd,

	decode_cmd_header: decode_cmd_header,

};

//加密字符串
function encrypt_cmd(cmd_buf){
	return cmd_buf;
}

//解密
function decrypt_cmd(cmd_buf){
	return cmd_buf;
}

//json编码
function _json_encode(stype, ctype, body){
	var cmd = {};
	cmd[0] = body;

	var str = JSON.stringify(cmd);
	//写入stype, ctype
	var cmd_buf = proto_tools.encode_str_cmd(stype, ctype, str);
	return cmd_buf;
}

//json解码
function _json_decode(cmd_buf){
	var cmd = proto_tools.decode_str_cmd(cmd_buf);
	var cmd_json = cmd[2];
	try{
		var body_set = JSON.parse(cmd_json);
		cmd[2] = body_set[0];//取出0
	}catch(e){
		return null;
	}
	
	if(!cmd || typeof(cmd[0]) == 'undefined' 
		|| typeof(cmd[1]) == 'undefined'
		|| typeof(cmd[2]) == 'undefined'){
		return null;
	}

	return cmd;
}

//key = stype+ctype   value = decoder/encoder
function get_key(stype, ctype){
	return (stype * 65536 + ctype);
}

/**
	消息封包
	param1: 协议类型 json/buf
	param2: 服务号  服务号和命令号不能为0
	param3: 命令号
	param4: 消息内容  为对应的json对象
	return 发送给客户端的字符串
*/
function encode_cmd(utag, proto_type, stype, ctype, body){
	var buf = null;
	if(proto_type == proto_man.PROTO_JSON){
		buf = _json_encode(stype, ctype, body);
	}else if(proto_type == proto_man.PROTO_BUF){
		var key = get_key(stype, ctype);
		if(!encoders[key]){
			log.error('未找到对应的加密器');
			return null;
		}
		// buf = encoders[key](body);
		//改为通用模板
		buf = encoders[key](stype, ctype,body);
	}

	proto_tools.write_utag_inbuf(buf, utag);
	proto_tools.write_prototype_inbuf(buf, proto_type);//写入协议类型
	return buf;
}

function decode_cmd_header(cmd_buf){
	var cmd = {};

	if(cmd_buf.length < proto_tools.header_size){
		return null;
	}

	cmd[0] = proto_tools.read_int16(cmd_buf, 0);
	cmd[1] = proto_tools.read_int16(cmd_buf, 2);
	cmd[2] = proto_tools.read_uint32(cmd_buf, 4);
	cmd[3] = proto_tools.read_int16(cmd_buf, 8);
	return cmd;
}

/*
* 消息解包  服务号和命令号不能为0
  param1: 协议类型
  param2: 接收到的客户端的数据
  返回: {0: stype, 1: ctype, 2: body}
*/
function decode_cmd(proto_type, stype, ctype, cmd_buf){
	// cmd_buf = decrypt_cmd(cmd_buf);//解密
	// log.info('@@@@@@@', cmd_buf);
	if(cmd_buf.length < proto_tools.header_size){
		return null;
	}

	var cmd = null;
	if(proto_type == proto_man.PROTO_JSON){
		cmd = _json_decode(cmd_buf);
	}else if(proto_type == proto_man.PROTO_BUF){
		// var stype = proto_tools.read_int16(cmd_buf, 0);
		// var ctype = proto_tools.read_int16(cmd_buf, 2);
		var key = get_key(stype, ctype);

		if(!decoders[key]){
			log.error('未找到对应的解密器');
			return null;
		}
		cmd = decoders[key](cmd_buf);
	}

	return cmd;
}

//buff协议的编码/解码管理  stype, ctype ==>encode/decode
var decoders = {};//保存当前buf协议所有的解码函数  stype,ctype ---> decoder
var encoders = {};//保存当前buf协议所有的编码函数, stype,ctype ===> encoder

//encode_func(body) return 二进制Buffer数据
function reg_buf_encoder(stype, ctype, encoder_func){
	var key = get_key(stype, ctype);
	if(encoders[key]){//已经注册过了，是否重复注册
		log.warn('stype: ', stype, "ctype: ", ctype, '已经注册过了.');
	}
	encoders[key] = encoder_func;
}

//decode_func(cmd_buf) return {0: stype, 1: ctype, 2: body}
function reg_buf_decoder(stype, ctype, decode_func){
	var key = get_key(stype, ctype);
	if(decoders[key]){//已经注册过了，是否重复注册
		log.warn('stype: ', stype, "ctype: ", ctype, '已经注册过了.');
	}
	decoders[key] = decode_func;
}

//end


module.exports = proto_man;

