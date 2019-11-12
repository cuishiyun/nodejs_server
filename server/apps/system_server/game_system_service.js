/*
	服务模板  如聊天室服务等
	date: 2019-02-15
*/
var log = require('../../utils/log.js');
var Cmd = require('../Cmd.js');
var Responses = require('../Responses.js');
var Stype = require('../Stype.js');
var utils = require('../../utils/utils.js');

require('./game_system_proto.js');
var system_model = require('./game_system_model.js');


function get_game_info(session, uid, proto_type, body){
	//验证数据合法性
	// if(!body){
	// 	session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_game_info, Responses.Invalid_params, uid, proto_type);
	// 	return;
	// }

	system_model.get_game_info(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_game_info, ret, uid, proto_type);
	});

}

function get_login_bonues(session, uid, proto_type, body){
	//验证数据合法性
	// if(!body){
	// 	session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_login_bonues, Responses.Invalid_params, uid, proto_type);
	// 	return;
	// }

	//test
	// session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_login_bonues, {
	// 	0: Responses.OK,
	// 	1: 1,
	// 	2: 2,
	// 	3: 300,
	// 	4: 4,
	// }, uid, proto_type);
	//test end
	system_model.get_login_bonues_info(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_login_bonues, ret, uid, proto_type);
	});

}

function recv_login_bonues(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.Game_system, Cmd.GameSystem.Recv_login_bonues, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var bonues_id = body;
	system_model.recv_login_bonues(uid, bonues_id, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game_system, Cmd.GameSystem.Recv_login_bonues, ret, uid, proto_type);
	});

}

function get_world_rank_info(session, uid, proto_type, body){
	// if(!body){
	// 	session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_world_rank_info, Responses.Invalid_params, uid, proto_type);
	// 	return;
	// }

	system_model.get_world_rank_info(uid, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_world_rank_info, ret, uid, proto_type);
	});

}

var service = {
	name: 'game_system_service',//服务名称
	is_transfer: false,//是否为转发模块
	
	/**
	 * 收到客户端给我们发过来的数据
	 * @param {*} session 
	 * @param {*} ctype 
	 * @param {*} body 
	 * @param {*} raw_cmd 为未解开的cmd,如果是网关只需要转发
	 */
	on_recv_player_cmd:  function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		log.info('system_service ', stype, ctype, 'utag = ', utag, body);
		switch(ctype){
			case Cmd.GameSystem.Get_game_info:
			{
                get_game_info(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameSystem.Get_login_bonues:
			{
				get_login_bonues(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameSystem.Recv_login_bonues:
			{
				recv_login_bonues(session, utag, proto_type, body);
			}
			break;
			case Cmd.GameSystem.Get_world_rank_info:
			{
				get_world_rank_info(session, utag, proto_type, body);
			}
			break;
			case Cmd.User_Disconnect:
				log.warn('用户' + utag + '掉线');
			break;
			default:
				log.error('system模块不能识别ctype = ', ctype);
			break;
		}
	},

	/**
	 * 收到连接的服务给我们发过来的数据
	 */
	on_recv_service_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){

	},

	/**
	 * 收到客户端断开连接  网关挂了
	 * @param {*} session 
	 */
	on_player_disconnect: function(stype, uid){

	},

};

module.exports = service;