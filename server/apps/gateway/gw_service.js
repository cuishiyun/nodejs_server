/*
	网关服务
	date: 2019-01-22
*/
var netbus = require('../../netbus/netbus.js');
var log = require('../../utils/log.js');
var proto_tools = require('../../netbus/proto_tools.js');
var proto_man = require('../../netbus/proto_man.js');
var Cmd = require('../Cmd.js');
var Stype = require('../Stype');
var Responses = require('../Responses.js');

function is_login_cmd(stype, ctype){
	if(stype != Stype.Auth){
		return false;
	}

	if(ctype == Cmd.Auth.GUEST_LOGIN || ctype == Cmd.Auth.UNAME_LOGIN){
		return true;
	}
	return false;
}

function is_before_login(stype, ctype){
	if(stype != Stype.Auth){
		return false;
	}

	var cmd_set = [Cmd.Auth.GUEST_LOGIN, Cmd.Auth.UNAME_LOGIN,
		 Cmd.Auth.GET_PHONE_REG_VARIFY, Cmd.Auth.PHONE_REG_ACCOUNT,
		Cmd.Auth.Get_forget_pwd_verify, Cmd.Auth.Reset_user_pwd];

	for(var i=0; i<cmd_set.length; i++){
		if(ctype == cmd_set[i]){
			return true;
		}
	}

	return false;
}

var uid_session_map = {};//网关保存了session和uid的对应关系,所以可以把数据发送回客户端

function get_session_by_uid(uid){
	return uid_session_map[uid];
}

function save_session_with_uid(uid, session, proto_type){
	uid_session_map[uid] = session;
	session.proto_type = proto_type;
}

function clear_session_with_uid(uid){
	uid_session_map[uid] = null;
	delete uid_session_map[uid];
}

var service = {
	name: 'gw_service',//服务名称
	is_transfer: true,//是否为转发模块
	
	/**
	 * 收到客户端给我们发过来的数据
	 * @param {*} session 
	 * @param {*} ctype 
	 * @param {*} body 
	 * @param {*} raw_cmd 为未解开的cmd,如果是网关只需要转发
	 */
	on_recv_player_cmd:  function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		log.info('网关收到的数据,stype = ' + stype + ',ctype = ' + ctype + ' ' + raw_cmd + ' ' + is_before_login(stype, ctype));
		var service_session = netbus.get_server_session(stype);
		if(!service_session){
			log.error('网关 未找到server_session');
			return;
		}

		//打入能够标识client的utag  uid/session.session_key
		if(is_before_login(stype, ctype)){//登陆用session_key
			utag = session.session_key;
		}else{
			if(session.uid == 0){
				//未登陆.  发送了非法的命令
				return;
			}	
			utag = session.uid;
		}

		//加上utag然后发给对应的服务器
		proto_tools.write_utag_inbuf(raw_cmd, utag);

		//转给对应的服务器
		service_session.send_encoded_cmd(raw_cmd);
	},

	/**
	 * 收到连接的服务给我们发过来的数据
	 */
	on_recv_server_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		var client_session;

		if(is_before_login(stype, ctype)){//utag == session_key
			client_session = netbus.get_client_session(utag);
			if(!client_session){
				return;
			}

			if(is_login_cmd(stype, ctype)){
				var cmd_ret = proto_man.decode_cmd(proto_type, stype, ctype, raw_cmd);
				body = cmd_ret[2];
				if(body.status == Responses.OK){//登录成功
					var prev_session = get_session_by_uid(body.uid);
					if(prev_session){	//以前登陆过, 发送一个命令给客户端
						prev_session.send_cmd(stype, Cmd.Auth.RELOGIN, null, 0, prev_session.proto_type);
						prev_session.uid = 0;//可能会有隐患,是否通知其他的服务
						netbus.session_close(prev_session);
					}
					client_session.uid = body.uid;//获取uid
					save_session_with_uid(body.uid, client_session, proto_type);
					
					body.uid = 0;//清除uid
					raw_cmd = proto_man.encode_cmd(utag, proto_type, stype, ctype, body);
				}
			}

		}else{//utag is uid
			client_session = get_session_by_uid(utag);
			if(!client_session){
				return;
			}
		}

		//消除utag,然后发给客户端
		proto_tools.clear_utag_inbuf(raw_cmd);
		client_session.send_encoded_cmd(raw_cmd);
	},

	/**
     * 收到客户端断开连接
     * @param {*} session 
     */
	on_player_disconnect: function(stype, uid){
		if(stype == Stype.Auth){//由auth服务保存的就由auth清空
			clear_session_with_uid(uid);
		}

		var server_session = netbus.get_server_session(stype);
		if(!server_session){
			return;
		}

		//客户端被迫掉线，
		// var utag = session.session_key;
		var utag = uid;
		server_session.send_cmd(stype, Cmd.User_Disconnect, null, utag, proto_man.PROTO_JSON);		
	},

};

service.get_session_by_uid = get_session_by_uid;

module.exports = service;