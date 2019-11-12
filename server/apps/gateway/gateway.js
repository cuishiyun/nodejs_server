/**
 * 网关服务器
 * 只有这台机器会放到外网,其他的服务器在局域网
 * 转发模块
 * 
 * 功能: 
 * (1)将客户端发来的数据转发给对应的服务器
 * (2)将对应的服务发回来的请求回给客户端
 * (3)做负载均衡 可选，可以考虑Maker-Work模式. 主要做服务,负载也可以通过服务开子服务解决
 * date: 2019-01-24
 */


require('../../init.js');
var game_config = require('../game_config.js');
var netbus = require("../../netbus/netbus.js");
var proto_man = require('../../netbus/proto_man.js');
var service_manager = require('../../netbus/service_manager.js');
var gw_service = require('./gw_service.js');
var bc_service = require('./bc_service.js');
var Stype = require('../Stype.js');

var host = game_config.gateway_config.host;
var ports = game_config.gateway_config.ports;// 6080,6081

//启动服务器  tcp协议
netbus.start_tcp_server(host, ports[0], true);//tcp buf/JSON
//websocket协议
netbus.start_ws_server(host, ports[1], true);//websocket buf/JSON

//把广播注册到网关上
service_manager.register_service(Stype.Broadcast, bc_service);

//gateway连接其他的服务器 --- 不加密
var game_server = game_config.gw_connect_servers;
for(var key in game_server){
    netbus.connect_tcp_server(game_server[key].stype, game_server[key].host, game_server[key].port, false);
    
    //把每个服务都注册到网关, 网关为转发,会转发到每个服务上去
    service_manager.register_service(game_server[key].stype, gw_service);
}
//end
