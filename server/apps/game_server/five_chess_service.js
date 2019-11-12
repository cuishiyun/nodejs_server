/*
	服务模板  如聊天室服务等
	date: 2019-02-19
*/
var log = require('../../utils/log.js');
var Cmd = require('../Cmd.js');
var Responses = require('../Responses.js');
var Stype = require('../Stype.js');
var utils = require('../../utils/utils.js');

require('./five_chess_proto.js');
var five_chess_model = require('./five_chess_model.js');

require('../gateway/bc_proto.js');//在游戏服务器注册广播协议

function enter_zone(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Enter_zone, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var zid = body;
	five_chess_model.enter_zone(uid, zid, session, proto_type, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Enter_zone, ret, uid, proto_type);
	});

}

function user_quit(session, uid, proto_type, body){
	five_chess_model.user_quit(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.User_Quit, ret, uid, proto_type);
	});
}

function send_prop(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Send_prop, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var propid = body[0];
	var to_seadid = body[1];

	five_chess_model.send_prop(uid, propid, to_seadid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Send_prop, ret, uid, proto_type);
	});
}

function send_do_ready(session, uid, proto_type, body){
	// if(!body){
	// 	session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Send_do_ready, Responses.Invalid_params, uid, proto_type);
	// 	return;
	// }

	five_chess_model.send_do_ready(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Send_do_ready, ret, uid, proto_type);
	});
}

function do_player_put_chess(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Put_chess, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var block_x = body[0];
	var block_y = body[1];

	five_chess_model.do_player_put_chess(uid, block_x, block_y, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Put_chess, ret, uid, proto_type);
	});
}

function do_player_get_prev_round_data(session, uid, proto_type, body){
	five_chess_model.do_player_get_prev_round_data(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Get_prev_round, ret, uid, proto_type);
	});
}

var service = {
	name: 'five_chess_service',//服务名称
	is_transfer: false,//是否为转发模块
	
	/**
	 * 收到客户端给我们发过来的数据
	 * @param {*} session 
	 * @param {*} ctype 
	 * @param {*} body 
	 * @param {*} raw_cmd 为未解开的cmd,如果是网关只需要转发
	 */
	on_recv_player_cmd:  function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		log.info('five_chess_service ', stype, ctype, 'utag = ', utag, body);
		switch(ctype){
			case Cmd.Game5Chess.Enter_zone:
			{
                enter_zone(session, utag, proto_type, body);
			}
			break;
			case Cmd.Game5Chess.User_Quit:
			{
				user_quit(session, utag, proto_type, body);
			}
			break;
			case Cmd.Game5Chess.Send_prop:
			{
				send_prop(session, utag, proto_type, body);
			}
			break;
			case Cmd.Game5Chess.Send_do_ready:
			{
				send_do_ready(session, utag, proto_type, body);
			}
			break;
			case Cmd.Game5Chess.Put_chess:
			{
				do_player_put_chess(session, utag, proto_type, body);
			}
			break;
			case Cmd.Game5Chess.Get_prev_round:
			{
				do_player_get_prev_round_data(session, utag, proto_type, body);
			}
			break;
			case Cmd.User_Disconnect:
			{
				log.warn('用户' + utag + '掉线');
				five_chess_model.user_lost_connect(utag);
			}
			break;
			default:
				log.error('five chess模块不能识别ctype = ', ctype);
			break;
		}
	},

	/**
	 * 收到连接的服务给我们发过来的数据
	 */
	on_recv_server_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){

	},

	/**
	 * 收到客户端断开连接  网关挂了
	 * @param {*} session 
	 */
	on_player_disconnect: function(stype, uid){

	},

};

module.exports = service;