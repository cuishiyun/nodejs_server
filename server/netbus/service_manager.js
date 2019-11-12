/*
* date: 2019-01-22
* 服务管理器

*/

var log = require('../utils/log.js');
var proto_man = require('./proto_man.js');

//存储所有的服务  客户端发过来的
var service_modules = {};

/**
 * 注册服务 
 * 给客户端使用
 * @param {*} stype 
 * @param {*} service 
 */
function register_service(stype, service){
	if(service_modules[stype]){
		log.warn(service_modules[stype].name, 'service is registed!!!');
	}
	service_modules[stype] = service;

	// log.info('register ' + stype + JSON.stringify(service_modules));
}

//收到玩家的数据包
function on_recv_client_cmd(session, cmd_buf){
	//根据收到的数据解码命令

	if(session.is_encrypt){
		log.info('解密数据');
		cmd_buf = proto_man.decrypt_cmd(cmd_buf);//解密
	}

	var stype, ctype, utag, proto_type, body;
	//解命令头
	var cmd_header = proto_man.decode_cmd_header(cmd_buf);
	if(!cmd_header){
		return false;
	}
	stype = cmd_header[0];
	ctype = cmd_header[1];
	utag = cmd_header[2];
	proto_type = cmd_header[3];
	// log.info('#########, stype = ', stype, 'ctype = ' + ctype + JSON.stringify(service_modules));

	if(!service_modules[stype]){
		log.error('未找到对应的模块, stype = ' + stype + JSON.stringify(service_modules));
		return false;
	}

	if(service_modules[stype].is_transfer){
		//转发给对应的服务
		service_modules[stype].on_recv_player_cmd(session, stype,ctype, null, utag, proto_type, cmd_buf);
		return true;
	}

	//0: cmd, 1: action, 2: body
	var cmd = proto_man.decode_cmd(proto_type, stype, ctype, cmd_buf);
	if(!cmd){
		log.error('服务管理器解析数据失败');
		return false;
	}

	body = cmd[2];
	service_modules[stype].on_recv_player_cmd(session, stype, ctype, body, utag, proto_type, cmd_buf);

	return true;
	//end
}

/**
 * 收到客户端发过来的数据  如果是网关：收到游戏客户端，如果是service： 收到网关的数据
 */
function on_recv_server_return(session, cmd_buf){
	if(session.is_encrypt){
		log.info('解密数据');
		cmd_buf = proto_man.decrypt_cmd(cmd_buf);//解密
	}

	var stype, ctype, utag, proto_type, body;
	//解命令头
	var cmd_header = proto_man.decode_cmd_header(cmd_buf);
	if(!cmd_header){
		return false;
	}
	stype = cmd_header[0];
	ctype = cmd_header[1];
	utag = cmd_header[2];
	proto_type = cmd_header[3];
	if(!service_modules[stype]){
		log.error('未找到对应的模块');
		return false;
	}
	if(service_modules[stype].is_transfer){
		//转发给对应的服务
		service_modules[stype].on_recv_server_return(session, stype, ctype, null, utag, proto_type, cmd_buf);
		return true;
	}

	//0: cmd, 1: action, 2: body
	var cmd = proto_man.decode_cmd(proto_type, stype, ctype, cmd_buf);
	if(!cmd){
		log.error('服务管理器解析数据失败');
		return false;
	}

	body = cmd[2];

	service_modules[stype].on_recv_server_return(session, stype, ctype, body, utag, proto_type, cmd_buf);

	return true;
}

//客户端掉线
function on_client_lost_connent(session){
	log.info('服务管理器 玩家离开');

	var uid = session.uid;
	if(uid == 0){
		return;
	}

	session.uid = 0;
	//遍历所有的服务模块,通知在这个服务上的这个玩家掉线了
	for(var key in service_modules){//key为stype
		if(service_modules[key].on_player_disconnect){
			service_modules[key].on_player_disconnect(key, uid);
		}
	}

}

//exports
var service_manager = {
	on_client_lost_connent: on_client_lost_connent,
	on_recv_client_cmd: on_recv_client_cmd,
	on_recv_server_return: on_recv_server_return,

	register_service: register_service,
};

module.exports = service_manager;
