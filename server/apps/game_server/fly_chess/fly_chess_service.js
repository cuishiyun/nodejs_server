/*
	飞行棋service
	date: 2019-03-01
*/
var log = require('../../../utils/log.js');
var Cmd = require('../../Cmd.js');
var Responses = require('../../Responses.js');
var Stype = require('../../Stype.js');
var utils = require('../../../utils/utils.js');

require('./fly_chess_proto.js');
var fly_chess_model = require('./fly_chess_model.js');

require('../../gateway/bc_proto.js');//在游戏服务器注册广播协议

function enter_zone(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_zone, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var zid = body['zid'];
	fly_chess_model.enter_zone(uid, zid, session, proto_type, function(ret){
        //返回给客户端
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_zone, ret, uid, proto_type);
	});

}

function exit_zone(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Exit_zone, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var zid = body;//body['zid'];
	fly_chess_model.exit_zone(uid, zid, session, proto_type, function(ret){
        //返回给客户端
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Exit_zone, ret, uid, proto_type);
	});
}

function enter_room(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_room, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var room_type = body;
	fly_chess_model.enter_room(uid, room_type, session, proto_type, function(ret){
        //返回给客户端
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_room, ret, uid, proto_type);
	});
}

function exit_room(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Exit_room, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var room_type = body;
	fly_chess_model.exit_room(uid, room_type, session, proto_type, function(ret){
        //返回给客户端
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Exit_room, ret, uid, proto_type);
	});
}

function send_do_ready(session, uid, proto_type, body){
	fly_chess_model.send_do_ready(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Send_do_ready, ret, uid, proto_type);
	});
}

function roll_shaizi(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Roll_shaizi, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var wantNum = body;

	fly_chess_model.roll_shaizi(uid, wantNum, function(ret){
		//返回给客户端
		session.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Roll_shaizi, ret, uid, proto_type);
	});
}

var service = {
	name: 'fly_chess_service',//服务名称
	is_transfer: false,//是否为转发模块
	
	/**
	 * 收到客户端给我们发过来的数据
	 * @param {*} session 
	 * @param {*} ctype 
	 * @param {*} body 
	 * @param {*} raw_cmd 为未解开的cmd,如果是网关只需要转发
	 */
	on_recv_player_cmd: function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		log.info('fly_chess_service ', stype, ctype, 'utag = ', utag, body);
		switch(ctype){
			case Cmd.GameFlyChess.Enter_zone:
			{
                enter_zone(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameFlyChess.Exit_zone:
			{
				exit_zone(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameFlyChess.Enter_room:
			{
				enter_room(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameFlyChess.Exit_room:
			{
				exit_room(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameFlyChess.Send_do_ready:
			{
				send_do_ready(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameFlyChess.Roll_shaizi:
			{
				roll_shaizi(session, utag, proto_type, body);
			}
			break;
			case Cmd.User_Disconnect:
			{
				log.warn('用户' + utag + '掉线');
				// fly_chess_model.user_lost_connect(utag);
			}
			break;
			default:
				log.error('fly chess模块不能识别ctype = ', ctype);
			break;
		}
	},

	/**
	 * 收到连接的服务给我们发过来的数据
	 */
	on_recv_server_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){
        log.info('on_recv_server_return');
	},

	/**
	 * 收到客户端断开连接  网关挂了
	 * @param {*} session 
	 */
	on_player_disconnect: function(stype, uid){
        log.info('on_player_disconnect');
	},

};

module.exports = service;