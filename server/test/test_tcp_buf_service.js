/*
	测试tcp service服务
	模拟向服务器发送数据
	2019-01-23
*/

var net = require("net");

var tcppkg = require("../netbus/tcppkg.js");
var proto_man = require('../netbus/proto_man.js');
var log = require('../utils/log.js');
require('./talk_room_proto.js');

var sock = net.connect({
	port: 6080,
	host: "127.0.0.1",
}, function() {
	console.log('connected to server!');
});

sock.on("connect",function() {
	console.log("connect success");

	var data = {
		uname: 'elviscui',
		upwd: '12345678'
	};

	//1,2, body = 'hello, talk room,i am elviscui'  如果是二进制,需要对应的解码器
	var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_BUF, 1, 12, data);
	// log.error('cmd_bufcmd_buf', cmd_buf);
	cmd_buf = tcppkg.package_data(cmd_buf);
	// cmd_buf = tcppkg.package_data('helloworld.');
	sock.write(cmd_buf);//发送给服务器

});



sock.on("error", function(e) {
	console.log("error", e);
});


sock.on("close", function() {
	console.log("close");
});


sock.on("end", function() {
	console.log("end event");
});

sock.on("data", function(data) {
	console.log(data);
});