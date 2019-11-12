/*
	协议工具
	2019-01-24
	小尾
*/

/*
	cmd_buf为Buffer对象
	offset  int
*/
function read_int8(cmd_buf, offset){
	return cmd_buf.readInt8(offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function write_int8(cmd_buf, offset, value){
	cmd_buf.writeInt8(value, offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function read_int16(cmd_buf, offset){
	return cmd_buf.readInt16LE(offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function write_int16(cmd_buf, offset, value){
	cmd_buf.writeInt16LE(value, offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function read_int32(cmd_buf, offset){
	return cmd_buf.readInt32LE(offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function write_int32(cmd_buf, offset, value){
	cmd_buf.writeInt32LE(value, offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function read_uint32(cmd_buf, offset){
	return cmd_buf.readUInt32LE(offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function write_uint32(cmd_buf, offset, value){
	cmd_buf.writeUInt32LE(value, offset);
}

/*
	byte_len读多少字节
*/
function read_str(cmd_buf, offset, byte_len){
	return cmd_buf.toString('utf8', offset, offset + byte_len);
}

function write_str(cmd_buf, offset, str){
	cmd_buf.write(str, offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function read_float(cmd_buf, offset){
	return cmd_buf.readFloatLE(offset);
}

/*
	cmd_buf为Buffer对象
	offset  int
*/
function write_float(cmd_buf, offset, value){
	cmd_buf.writeFloatLE(value, offset);
}

function alloc_buffer(total_len){
	return Buffer.allocUnsafe(total_len);
}

function write_cmd_header_inbuf(cmd_buf, stype, ctype){
	write_int16(cmd_buf, 0, stype);
	write_int16(cmd_buf, 2, ctype);

	write_uint32(cmd_buf, 4, 0);
	return proto_tools.header_size;
}

function write_str_inbuf(cmd_buf, offset, str, byte_len){
	//写入两个字节的字符串长度信息
	if(typeof(byte_len) == 'undefined'){
		byte_len = str.utf8_byte_len();
	}
	write_int16(cmd_buf, offset, byte_len);
	offset += 2;

	write_str(cmd_buf, offset, str);
	offset += byte_len;

	return offset;
}

//返回 str, offset
function read_str_inbuf(cmd_buf, offset){
	var byte_len = read_int16(cmd_buf, offset);
	offset += 2;

	var str = read_str(cmd_buf, offset, byte_len);
	offset += byte_len;

	return [str, offset];
}

//解码空的命令
function decode_empty_cmd(cmd_buf){
	var cmd = {};
	cmd[0] = read_int16(cmd_buf, 0);
	cmd[1] = read_int16(cmd_buf, 2);
	cmd[2] = null;
	return cmd;
}

//编码空的命令
function encode_empty_cmd(stype, ctype, body){
	var cmd_buf = alloc_buffer(proto_tools.header_size);
	write_cmd_header_inbuf(cmd_buf, stype, ctype);
	return cmd_buf;
}

function decode_status_cmd(cmd_buf){
	var cmd = {};
	cmd[0] = read_int16(cmd_buf, 0);
	cmd[1] = read_int16(cmd_buf, 2);
	// cmd[2] = read_int16(cmd_buf, proto_tools.header_size);
	var str = read_str_inbuf(cmd_buf, proto_tools.header_size)[0];
	try{
		cmd[2] = JSON.parse(str);
	}catch(e){
		cmd[2] = str;
	}
	return cmd;
}

function encode_status_cmd(stype, ctype, status){
	var total_len = proto_tools.header_size + 2;
	var type = Object.prototype.toString.call(status);
	if(type === "[object Object]"){
		total_len += JSON.stringify(status).utf8_byte_len();
	}else{
		total_len += status.utf8_byte_len();
	}
	var cmd_buf = alloc_buffer(total_len);
	write_cmd_header_inbuf(cmd_buf, stype, ctype);
	// write_int16(cmd_buf, proto_tools.header_size, status);
	if(type === "[object Object]"){
		var tempstr = JSON.stringify(status);
		write_str_inbuf(cmd_buf, proto_tools.header_size, tempstr);
	}else{
		write_str_inbuf(cmd_buf, proto_tools.header_size, status);
	}
	return cmd_buf;
}

function decode_str_cmd(cmd_buf){
	var cmd = {};
	cmd[0] = read_int16(cmd_buf, 0);
	cmd[1] = read_int16(cmd_buf, 2);
	
	var ret = read_str_inbuf(cmd_buf, proto_tools.header_size);
	cmd[2] = ret[0];

	return cmd;
}

function encode_str_cmd(stype, ctype, str){
	var byte_len = str.utf8_byte_len();
	var total_len = proto_tools.header_size + 2 + byte_len;
	var cmd_buf = alloc_buffer(total_len);

	var offset = write_cmd_header_inbuf(cmd_buf, stype, ctype);
	offset = write_str_inbuf(cmd_buf, offset, str, byte_len);

	return cmd_buf;
}

function write_prototype_inbuf(cmd_buf, proto_type){
	write_int16(cmd_buf, 8, proto_type);
}

function write_utag_inbuf(cmd_buf, utag){
	write_uint32(cmd_buf, 4, utag);
}

function clear_utag_inbuf(cmd_buf){
	write_uint32(cmd_buf, 4, 0);
}

var proto_tools = {
	header_size: 10,// 2(stype) + 2(ctype) + 4(utag) + 2(协议类型 buf/json)

	//源操作 	
	read_int8: read_int8,
	write_int8: write_int8,
	
	read_int16: read_int16,
	write_int16: write_int16,
	
	read_int32: read_int32,
	write_int32: write_int32,

	read_uint32: read_uint32,
	write_uint32: write_uint32,

	read_float: read_float,
	write_float: write_float,

	alloc_buffer: alloc_buffer,

	//通用操作
	write_cmd_header_inbuf: write_cmd_header_inbuf,
	write_str_inbuf: write_str_inbuf,
	read_str_inbuf: read_str_inbuf,

	//模板编码解码器
	encode_str_cmd: encode_str_cmd,
	encode_status_cmd: encode_status_cmd,
	encode_empty_cmd: encode_empty_cmd,

	decode_str_cmd: decode_str_cmd,
	decode_status_cmd: decode_status_cmd,
	decode_empty_cmd: decode_empty_cmd,

	write_prototype_inbuf: write_prototype_inbuf,
	write_utag_inbuf: write_utag_inbuf,
	clear_utag_inbuf: clear_utag_inbuf,

};

module.exports = proto_tools;
