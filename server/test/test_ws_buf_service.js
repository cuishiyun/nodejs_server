/*
	客户端websocket,模拟向服务器发送数据
	date: 2019-01-23
*/

var ws = require("ws");
var proto_man = require('../netbus/proto_man.js');
require('./talk_room_proto.js');

// url ws://127.0.0.1:6080
// 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
var sock = new ws("ws://127.0.0.1:6082");
sock.on("open", function () {
	console.log("connect success !!!!");
	var cmd = {
		uname: 'ws client',
		upwd: 'password'
	};
	var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_BUF, 1, 12, cmd);
	sock.send(cmd_buf);
});

sock.on("error", function(err) {
	console.log("error: ", err);
});

sock.on("close", function() {
	console.log("close");
});

sock.on("message", function(data) {
	console.log(data);
});
