/*
    广播服务
    游戏服务器发送数据和玩家的uid，网关根据uid依次把数据发给玩家
	date: 2019-02-21
*/

require('./bc_proto.js');//注册编码解码器
var gw_service = require('./gw_service.js');
var log = require('../../utils/log.js');
var proto_tools = require('../../netbus/proto_tools.js');

var service = {
	name: 'broadcast service',//服务名称
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
        log.info('广播服务收到消息' + stype, ctype, body);
        var cmd_buf = body.cmd_buf;
        var users = body.users;

        for(var i in users){
            var client_session = gw_service.get_session_by_uid(users[i]);
            if(!client_session){
                continue;//用户掉线
            }

            // var tempStype = proto_tools.read_int16(cmd_buf, 0);
            // var tempctype = proto_tools.read_int16(cmd_buf, 2);
            // var uid = proto_tools.read_int32(cmd_buf, 4);
            // log.error(tempStype, tempctype, uid);
            client_session.send_encoded_cmd(cmd_buf);
        }
	},

	/**
	 * 收到客户端断开连接
	 * @param {*} session 
	 */
	on_player_disconnect: function(stype, uid){

	},

};

module.exports = service;