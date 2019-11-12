/*
	服务模板  如聊天室服务等
	date: 2019-01-22
*/

var service = {
	name: 'service template',//服务名称
	is_transfer: false,//是否为转发模块
	
	/**
	 * 收到客户端给我们发过来的数据
	 * @param {*} session 
	 * @param {*} ctype 
	 * @param {*} body 
	 * @param {*} raw_cmd 为未解开的cmd,如果是网关只需要转发
	 */
	on_recv_player_cmd:  function(session, stype, ctype, body, utag, proto_type, raw_cmd){

	},

	/**
	 * 收到连接的服务给我们发过来的数据
	 */
	on_recv_server_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){

	},

	/**
	 * 收到客户端断开连接
	 * @param {*} session 
	 */
	on_player_disconnect: function(stype, uid){

	},

};

module.exports = service;