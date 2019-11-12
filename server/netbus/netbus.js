/**
	负责tcp和websocket的链接和转发
	转发协议,解析只解析stype,然后转发给其他的service
* author: elviscui
* date: 2019-01-22
*/
var net = require("net");// 将net模块 引入进来
var ws = require("ws");// 加载node上websocket模块 ws;

var log = require("../utils/log.js");
var tcppkg = require("./tcppkg.js");
var proto_man = require('./proto_man.js');
var proto_tools = require('./proto_tools.js');
var service_manager = require('./service_manager.js');

var str_proto = {
	1: 'PROTO_JSON',
	2: 'PROTO_BUF'
};

var netbus = {
	start_tcp_server: start_tcp_server,
	start_ws_server: start_ws_server,
	// session_send: session_send,
	session_close: session_close,

	connect_tcp_server: connect_tcp_server,
	get_client_session: get_client_session,//如果是服务：就是返回给网关,如果是网关:就是返回给游戏客户端
	get_server_session: get_server_session,//通过这个session可以把数据返回给其他的服务
};

//所有的客户端用户
var global_session_list = {};//如果是服务：就是返回给网关,如果是网关:就是返回给游戏客户端
var global_session_key = 1;//key++ 

/**
 * 获取客户端session
 * @param {*} session_key 
 */
function get_client_session(session_key){
	return global_session_list[session_key];
}

//客户端进来 is_ws是否websocket还是普通的tcp socket
function on_session_enter(session, is_ws, is_encrypt){
	if(is_ws){
		log.info("session enter", session._socket.remoteAddress, session._socket.remotePort,'is_ws = ',is_ws);
	}else{
		log.info("session enter", session.remoteAddress, session.remotePort,'is_ws = ',is_ws);
	}
	session.last_pkg = null;//表示存储的上一次没有处理完的TCP包
	session.is_ws = is_ws;
	session.is_connected = true;
	session.is_encrypt = is_encrypt;
	session.uid = 0;//用户唯一标识 uid

	//扩展session的方法. 供外部使用
	session.send_encoded_cmd = session_send_encode_cmd;
	session.send_cmd = session_send_cmd;

	//保存用户到session列表中
	global_session_list[global_session_key] = session;
	session.session_key = global_session_key;//session_key为自增,uid为用户唯一id
	global_session_key++;

}

//客户端离开
function on_session_exit(session){
	log.info("session exit", ' is_ws = ', session.is_ws);

	service_manager.on_client_lost_connent(session);

	session.last_pkg = null;
	session.is_ws = false;
	session.is_connected = false;

	//从列表删除用户的socket
	if(global_session_list[session.session_key]){
		global_session_list[session.session_key] = null;
		delete global_session_list[session.session_key];//把key value从list中移除
		session.session_key = null;
	}

}

//一定能保证是一个完整的数据包  json格式就是字符串,buf格式就是二进制数据
function on_session_recv_cmd(session, cmd_buf){
	var result = service_manager.on_recv_client_cmd(session, cmd_buf);
	if(result == false){
		log.error('解码失败');
		session_close(session);
	}
}

/*
	session的方法,this代表session(socket)
*/
function session_send_cmd(stype, ctype, body, utag, proto_type){
	if(this.is_connected == false){
		log.error('客户端未连接,不能发送消息');
		return;
	}

	var cmd = null;
	cmd = proto_man.encode_cmd(utag, proto_type, stype, ctype, body);
	if(cmd){
		this.send_encoded_cmd(cmd);
	}

}

/*
	发送命令  -- 已经加密过
	session的方法,this代表session(socket)
*/
function session_send_encode_cmd(cmd){
	if(this.is_connected == false){
		log.error('客户端未连接,不能发送消息');
		return;
	}

	if(this.is_encrypt){
		log.info('加密数据');
		cmd = proto_man.encrypt_cmd(cmd);//加密
	}

	var session = this;
	if(session.is_ws == false){
		var data = tcppkg.package_data(cmd);
		var stype = proto_tools.read_int16(cmd, 0);
		var ctype = proto_tools.read_int16(cmd, 2);
		var uid = proto_tools.read_int32(cmd, 4);
		log.info('回给内部客户端的消息为: stype = ' + stype + ',ctype = ' + ctype + ',uid = ' + uid + ',body = ' + data);
		session.write(data);
		return;
	}else{
		var stype = proto_tools.read_int16(cmd, 0);
		var ctype = proto_tools.read_int16(cmd, 2);
		var uid = proto_tools.read_int32(cmd, 4);
		log.info('回给客户端的消息为: stype = ' + stype + ',ctype = ' + ctype + ',uid = ' + uid + ',body = ' + cmd);
		session.send(cmd);
	}
}

//关闭一个session
function session_close(session){
	log.warn('服务器主动关闭了socket', session.is_ws, session.session_key);
	if(session.is_ws == false){
		session.end();
		return;
	}else{
		session.close();
		return;
	}
}

//.............................tcp server begin.................
function add_client_session_event_listener(session, is_encrypt){
	// 设置你接受的格式, 
	// session.setEncoding("utf8");
	// session.setEncoding("hex"); // 转成二进制的文本编码
	// 
	// 客户端断开连接的时候处理,用户断线离开了  客户端关闭socket
	session.on("close", function() {
		on_session_exit(session);
	});

	// 接收到客户端的数据，调用这个函数
	// data 默认是Buffer对象，如果你强制设置为utf8,那么底层会先转换成utf8的字符串，传给你
	// hex 底层会把这个Buffer对象转成二进制字符串传给你
	// 如果你没有设置任何编码 <Buffer 48 65 6c 6c 6f 57 6f 72 6c 64 21>
	// utf8 --> HelloWorld!!!   hex--> "48656c6c6f576f726c6421"
	session.on("data", function(data) {
		//检测数据合法性
		if(!Buffer.isBuffer(data)){
			log.error('tcp协议未收到buf类型的数据');
			session_close(session);
			return;
		}
		//end

		// log.info('tcp socket, data = ', data);
		var last_pkg = session.last_pkg;
		if (last_pkg != null) { // 上一次剩余没有处理完的半包;
			var buf = Buffer.concat([last_pkg, data], last_pkg.length + data.length);
			last_pkg = buf;
		}
		else {
			last_pkg = data;	
		}

		var offset = 0;
		var pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
		if (pkg_len < 0) {
			return;
		}

		while(offset + pkg_len <= last_pkg.length) { // 判断是否有完整的包;		
			// 根据长度信息来读取我们的数据
			var cmd_buf;
			cmd_buf = Buffer.allocUnsafe(pkg_len - 2); // 2个长度信息
			last_pkg.copy(cmd_buf, 0, offset + 2, offset + pkg_len);
			on_session_recv_cmd(session, cmd_buf);

			offset += pkg_len;
			if (offset >= last_pkg.length) { // 正好我们的包处理完了;
				break;
			}

			pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
			if (pkg_len < 0) {
				break;
			}
		}

		// 能处理的数据包已经处理完成了,保存 0.几个包的数据
		if (offset >= last_pkg.length) {
			last_pkg = null;
		}
		else { // offset, length这段数据拷贝到新的Buffer里面
			var buf = Buffer.allocUnsafe(last_pkg.length - offset);
			last_pkg.copy(buf, 0, offset, last_pkg.length);
			last_pkg = buf;
		}

		session.last_pkg = last_pkg;
		// end 
	});


	session.on("error", function(err) {
		// console.log("error", err);
	});

	on_session_enter(session, false, is_encrypt);

}

//is_encrypt 是否加密
function start_tcp_server(ip, port, is_encrypt) {
	log.info('start_tcp_server, ip = ', ip, ", port = ", port);
	// 创建一个net.Server用来监听,当连接进来的时候，就会调用我们的函数
	// client_sock,就是我们的与客户端通讯建立连接配对的socket
	// client_sock 就是与客户端通讯的net.Socket
	var server = net.createServer(function(client_sock) { 
		add_client_session_event_listener(client_sock, is_encrypt);
	});

	// 监听发生错误的时候调用
	server.on("error", function() {
		log.error("server listen error");
	});

	//服务器关闭socket
	server.on("close", function() {
		log.error("server listener close");
	});

	server.listen({
		port: port,
		// host: ip,//如果加了这个host，外部无法连接
		exclusive: true,
	});


}

//....................tcp server end..............

//....................websocket begin............

//js判断一个对象是不是字符串
function isString(obj){
	return Object.prototype.toString.call(obj) === "[object String]";  
}

// 监听接入进来的客户端事件
function ws_add_client_session_event_listener(session, is_encrypt) {
	// close事件
	session.on("close", function() {
		on_session_exit(session);
	});

	// error事件
	session.on("error", function(err) {
		log.info("client error", err);
	});
	// end 

	// message 事件, data已经是根据websocket协议解码开来的原始数据；
	// websocket底层有数据包的封包协议，所以，绝对不会出现粘包的情况。
	// 每解一个数据包，就会触发一个message事件;
	// 不会出现粘包的情况，send一次，就会把send的数据独立封包。
	// 想我们如果是直接基于TCP，我们要自己实现类是于websocket封包协议；
	session.on("message", function(data) {
			if(Buffer.isBuffer(data) == false){
				log.error('ws, buf协议, 收到的数据不是buf');
				session_close(session);
				return;
			}
			on_session_recv_cmd(session, data);
		//}

	});
	// end 

	on_session_enter(session, true, is_encrypt);
}

function start_ws_server(ip, port, is_encrypt){
	log.info('start_ws_server, ip = ', ip, ', port = ', port);
	// 启动基于websocket的服务器,监听我们的客户端接入进来。
	var server = new ws.Server({
		//host: ip, //如果加了，外部链接不上
		port: port,
	});

	// connection 事件, 有客户端接入进来;
	function on_ws_client_comming (client_sock) {
		log.info("ws client comming");
		ws_add_client_session_event_listener(client_sock, is_encrypt);
	}
	server.on("connection", on_ws_client_comming);

	// error事件,表示的我们监听错误;
	function on_ws_listen_error(err) {
		log.info('ws listen error');
	}
	server.on("error", on_ws_listen_error);

	// headers事件, 回给客户端的字符。
	function on_ws_headers(data) {
		// console.log(data);
	}
	server.on("headers", on_ws_headers);

	function on_ws_listen_close(data) {
		log.info('ws listen close');
	}
	server.on('close', on_ws_listen_close);

}


//....................websocket end.............
//所有的服务器session  key为stype  保存的是服务器上的客户端session
var server_connect_list = {};//通过这个session可以把数据返回给其他的服务
function get_server_session(stype){
	return server_connect_list[stype];
}

/**
 * 一定能保证是一个完整的数据包  json格式就是字符串,buf格式就是二进制数据
 * @param {*} session 
 * @param {*} cmd_buf 
 */
function on_recv_cmd_server_return(session, cmd_buf){
	var result = service_manager.on_recv_server_return(session, cmd_buf);
	if(result == false){
		log.error('解码失败');
		session_close(session);
	}
}

//客户端离开
function on_session_disconnect(session){
	session.last_pkg = null;
	session.is_ws = false;
	session.is_connected = false;

	var stype = session.session_key;
	session.session_key = null;

	//从列表删除用户的socket
	if(server_connect_list[stype]){
		server_connect_list[stype] = null;
		delete server_connect_list[stype];//把key value从list中移除
	}

}

//session成功连接到其他的服务器上 --- 网关使用
function on_session_connected(stype, session, is_ws, is_encrypt){
	if(is_ws){
		log.info("session connect", session._socket.remoteAddress, session._socket.remotePort,'is_ws = ',is_ws);
	}else{
		log.info("session connect", session.remoteAddress, session.remotePort,'is_ws = ',is_ws);
	}
	session.last_pkg = null;//表示存储的上一次没有处理完的TCP包
	session.is_ws = is_ws;
	session.is_connected = true;
	session.is_encrypt = is_encrypt;

	//扩展session的方法. 供外部使用
	session.send_encoded_cmd = session_send_encode_cmd;
	session.send_cmd = session_send_cmd;

	//保存用户到session列表中
	server_connect_list[stype] = session;
	session.session_key = stype;//session key设置为stype
}

//gameway需要连接其他的服务器
function connect_tcp_server(stype, host, port, is_encrypt){
	var session = net.connect({
		port: port,
		host: host,
	});

	session.is_connected = false;
	//连接成功
	session.on("connect",function() {
		session.is_connected = true;
		on_session_connected(stype, session, false, is_encrypt);
	});
	
	// 设置你接受的格式, 
	// session.setEncoding("utf8");
	// session.setEncoding("hex"); // 转成二进制的文本编码

	// 客户端断开连接的时候处理,用户断线离开了  客户端关闭socket
	session.on("close", function() {
		if(session.is_connected === true){
			on_session_disconnect(session);
		}
		session.end();
		//重新连接到服务器 3秒后重新连接服务器
		setTimeout(function(){
			log.warn('reconnect: ', stype, host, port, is_encrypt);
			connect_tcp_server(stype, host, port, is_encrypt);
		}, 3000);
		//end
	});

	// 接收到客户端的数据，调用这个函数
	// data 默认是Buffer对象，如果你强制设置为utf8,那么底层会先转换成utf8的字符串，传给你
	// hex 底层会把这个Buffer对象转成二进制字符串传给你
	// 如果你没有设置任何编码 <Buffer 48 65 6c 6c 6f 57 6f 72 6c 64 21>
	// utf8 --> HelloWorld!!!   hex--> "48656c6c6f576f726c6421"
	session.on("data", function(data) {
		//检测数据合法性
		if(!Buffer.isBuffer(data)){
			log.error('tcp协议未收到buf类型的数据');
			session_close(session);
			return;
		}
		//end

		// log.info('tcp socket, data = ', data);
		var last_pkg = session.last_pkg;
		if (last_pkg != null) { // 上一次剩余没有处理完的半包;
			var buf = Buffer.concat([last_pkg, data], last_pkg.length + data.length);
			last_pkg = buf;
		}
		else {
			last_pkg = data;	
		}

		var offset = 0;
		var pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
		if (pkg_len < 0) {
			return;
		}

		while(offset + pkg_len <= last_pkg.length) { // 判断是否有完整的包;		
			// 根据长度信息来读取我们的数据
			var cmd_buf;
			cmd_buf = Buffer.allocUnsafe(pkg_len - 2); // 2个长度信息
			last_pkg.copy(cmd_buf, 0, offset + 2, offset + pkg_len);
			//log.warn('收到内部服务器返回的结果.is_encrypt = ' + session.is_encrypt +　cmd_buf);
			on_recv_cmd_server_return(session, cmd_buf);

			offset += pkg_len;
			if (offset >= last_pkg.length) { // 正好我们的包处理完了;
				break;
			}

			pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
			if (pkg_len < 0) {
				break;
			}
		}

		// 能处理的数据包已经处理完成了,保存 0.几个包的数据
		if (offset >= last_pkg.length) {
			last_pkg = null;
		}
		else { // offset, length这段数据拷贝到新的Buffer里面
			var buf = Buffer.allocUnsafe(last_pkg.length - offset);
			last_pkg.copy(buf, 0, offset, last_pkg.length);
			last_pkg = buf;
		}

		session.last_pkg = last_pkg;
		// end 
	});


	session.on("error", function(err) {
		// console.log("error", err);
	});

}

module.exports = netbus;