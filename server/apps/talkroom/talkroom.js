/*
	聊天室服务
	2019-01-22
*/
var log = require('../../utils/log.js');
var proto_man = require('../../netbus/proto_man.js');
require('./talkroom_proto.js');
var Cmd = require('../Cmd.js');

var STYPE_TALKROOM = 1;//cmd

var TalkCmd = {
	Enter: 1,//用户进来
	Exit: 2,//用户离开
	UserArrived: 3,//别人进来
	UserExit: 4,//别人离开

	SendMsg: 5,//自己发送消息
	UserMsg: 6,//收到别人的消息

};

//回复给客户端的
var Responses = {
	OK: 1,//进入成功
	IS_IN_ROOM: -100,//已经在聊天室里
	IS_NOTIN_ROOM: -101,//玩家不在聊天室里
	INVALD_OPT: -102,//玩家非法操作
	INVALD_PARAMS: -103,//玩家命令格式不对
};

//保存聊天室里面的所有用户
var room = {};

/*
	发给所有人 ---> 广播
	noto_user 不发给谁  （socket对象）
	body为对象
*/
function broadcast_cmd(ctype, body, noto_user){
	var json_encoded = null;
	var buf_encoded = null;

	for(var key in room){
		if(room[key].utag == noto_user){
			continue;
		}

		var proto_type = room[key].proto_type;
		var utag = room[key].utag;
		//本来可以这么写
		// room[key].session.send_cmd(STYPE_TALKROOM, ctype, body);
		if(proto_type == proto_man.PROTO_JSON){
			if(json_encoded == null){
				json_encoded = proto_man.encode_cmd(utag, proto_type, STYPE_TALKROOM, ctype, body);
			}
			room[key].session.send_encoded_cmd(json_encoded);
		}else if(proto_type == proto_man.PROTO_BUF){
			if(buf_encoded == null){
				buf_encoded = proto_man.encode_cmd(utag, proto_type, STYPE_TALKROOM, ctype, body);
			}
			room[key].session.send_encoded_cmd(buf_encoded);
		}

	}
}

/*
	session 为进来的客户端  对于聊天室而言，session为网关
	客户端: stype, ctype, 
	body = {
		uname: '名字', 
		usex: 0 or 1,//性别
	};
	body为对象
*/
function on_user_enter_talkroom(session, body, utag, proto_type){
	log.warn('用户' + utag + '进入聊天室', 'body = ' + JSON.stringify(body));
	if(typeof(body.uname) == 'undefined' || typeof(body.usex) == 'undefined'){
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, {
			0: Responses.INVALD_PARAMS
		}, utag, proto_type);
		log.error('用户名或性别为空');
		return;
	}

	if(room[utag]){//用户已经在聊天室中,重复发送进入消息
		log.error('用户已经在聊天室里,不能重复进入');
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, {
			0: Responses.IS_IN_ROOM
		}, utag, proto_type);
		return;
	}

	//告诉自己进来成功了
	session.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, {
		0: Responses.OK,
	}, utag, proto_type);
	//把刚进来的玩家广播给其他玩家
	broadcast_cmd(TalkCmd.UserArrived, body, utag);
	//把其他玩家的信息发给刚进来的玩家 
	for(var key in room){
		if(room[key].session != session){
			session.send_cmd(STYPE_TALKROOM, TalkCmd.UserArrived, room[key].uinfo, utag, proto_type);
		}
	}

	//保存玩家信息到聊天室
	var talk_man = {
		session: session,
		utag: utag,//标识用户
		proto_type: proto_type,
		uinfo: body,
	};
	if(!room[utag]){
		room[utag] = talk_man;
	}

}

/*
	用户离开聊天室
	is_discontent 是否掉线
*/
function on_user_exit_talkroom(session, is_discontent, utag, proto_type){
	if(is_discontent == false){
		log.warn('用户'+ utag + '离开聊天室');
	}else{
		log.warn('用户' + utag + '断线!');
	}

	if(!room[utag]){//用户不在聊天室，也就不存在离开
		if(is_discontent == false){//主动发送的离开
			session.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, {
				0: Responses.IS_NOTIN_ROOM
			}, utag, proto_type);
		}
		return;
	}

	//广播给其他人,不包括自己
	broadcast_cmd(TalkCmd.UserExit, room[utag].uinfo, utag);

	//把你的数据从聊天室中删除
	room[utag] = null;
	delete room[utag];

	if(is_discontent == false){
		//发送给自己, 退出成功
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, {
			0: Responses.OK
		}, utag, proto_type);
	}

}

/*
	玩家主动发送消息
	body为对象
*/
function on_user_send_msg(session, body, utag, proto_type){
	log.warn('用户' + utag + '发送聊天室消息,msg = ' + body);
	if(!room[utag]){//不在聊天室
		session.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, {
			0: Responses.INVALD_OPT
		}, utag, proto_type);
		return;
	}

	//发送成功,回给客户端
	session.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, {
		0: Responses.OK,
		1: room[utag].uinfo.uname,
		2: room[utag].uinfo.usex,
		3: body
	}, utag, proto_type);

	//告诉其他人,这个人发送了一条消息
	broadcast_cmd(TalkCmd.UserMsg, {
		0: room[utag].uinfo.uname,
		1: room[utag].uinfo.usex,
		2: body
	}, utag);

}

var service = {
	name: 'talk room',//服务名称
	is_transfer: false,//是否为转发模块

	//每个服务收到数据的时候调用
	on_recv_player_cmd:  function(session, stype, ctype, body,  utag, proto_type, raw_cmd){
		log.info(this.name + ' services on_recv_player_cmd', ctype, body);
	
		switch(ctype){
			case TalkCmd.Enter://用户进来
				on_user_enter_talkroom(session, body, utag, proto_type);
			break;
			case TalkCmd.Exit://用户离开
				//false代表用户主动退出,而不是断线
				on_user_exit_talkroom(session, false, utag, proto_type);
			break;
			case TalkCmd.SendMsg://自己发送消息
				on_user_send_msg(session, body, utag, proto_type);
			break;
			case Cmd.User_Disconnect://网关转发过来的,用户被迫掉线
				on_user_exit_talkroom(session, true, utag, proto_type);
			break;
			default:
				log.error('聊天室未能区分出ctype, ctype = ' + ctype);
			break;
		}

	},

	on_recv_server_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		log.info('');	
	},

	/**
     * 收到客户端断开连接   网关丢失连接  被动丢失连接
     * @param {*} session 
     */
	on_player_disconnect: function(stype, uid){
		log.warn('网关与聊天室端口连接丢失: ', uid + '网关挂了');
		// log.info(this.name + 'services on_player_disconnect', utag);
		// on_user_exit_talkroom(session, true);
	},

};

module.exports = service;


