/*
	测试tcp service服务
	模拟向服务器发送数据
	2019-01-22
*/

var net = require("net");

var tcppkg = require("../netbus/tcppkg.js");
var proto_man = require('../netbus/proto_man.js');

var sock = net.connect({
	port: 6081,
	host: "127.0.0.1",
}, function() {
	console.log('connected to server!');
});

sock.on("connect",function() {
	console.log("connect success");

	//1,2, body = 'hello, talk room,i am elviscui'
	var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 1, 12, 'hello, talk room,i am elviscui');
	cmd_buf = tcppkg.package_data(cmd_buf);
	// cmd_buf = tcppkg.package_data('helloworld.');
	sock.write(cmd_buf);

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