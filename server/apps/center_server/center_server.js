/**
 * 数据中心服务器
 * 2019-01-28
 */
require('../../init.js');
var game_config = require('../game_config.js');
var netbus = require("../../netbus/netbus.js");
var proto_man = require('../../netbus/proto_man.js');
var service_manager = require('../../netbus/service_manager.js');
var Stype = require('../Stype.js');

var auth_service = require('./auth_service.js');

var center = game_config.center_server;
netbus.start_tcp_server(center.host, center.port, false);

//注册auth服务
service_manager.register_service(Stype.Auth, auth_service);

//连接中心数据库
var mysql_center = require('../../database/mysql_center.js');
mysql_center.connect(game_config.center_database.host, game_config.center_database.port,game_config.center_database.db_name,game_config.center_database.uname,game_config.center_database.upwd);

//连接中心服务器的redis
var center_redis_config = game_config.center_redis;
var redis_center = require('../../database/redis_center.js');
redis_center.connect_to_center(center_redis_config.host, center_redis_config.port, center_redis_config.db_index);

