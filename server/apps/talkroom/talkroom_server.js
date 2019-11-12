/**
	启动服务器
* 2019-01-22
*/

require('../../init.js');

var netbus = require("../../netbus/netbus.js");
var proto_man = require('../../netbus/proto_man.js');
var service_manager = require('../../netbus/service_manager.js');
var talk_room = require('./talkroom.js');
var game_config = require('../game_config.js');

var talk_server = game_config.gw_connect_servers['聊天服务器'];
//启动服务器  tcp协议  内部不加密
netbus.start_tcp_server(talk_server.host, talk_server.port, false);//tcp buf
// netbus.start_tcp_server(talk_server.host, 6085, false);//tcp json

//注册聊天室服务
service_manager.register_service(1, talk_room);


