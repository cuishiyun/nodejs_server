/*
	客户端websocket,模拟向服务器发送数据
	date: 2019-01-23
*/

var ws = require("ws");
var proto_man = require('../netbus/proto_man.js');

// url ws://127.0.0.1:6080
// 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
var sock = new ws("ws://127.0.0.1:6083");
sock.on("open", function () {//ws不需要封包再发送
	console.log("connect success !!!!");
	var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 1, 12, 'hello, websocket');
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
