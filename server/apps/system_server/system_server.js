/**
 * 数据中心服务器
 * 2019-02-15
 */
require('../../init.js');
var game_config = require('../game_config.js');
var netbus = require("../../netbus/netbus.js");
var proto_man = require('../../netbus/proto_man.js');
var service_manager = require('../../netbus/service_manager.js');
var Stype = require('../Stype.js');

var game_system_service = require('./game_system_service.js');

var game_system_server = game_config.game_system_server;
netbus.start_tcp_server(game_system_server.host, game_system_server.port, false);

//注册system服务
service_manager.register_service(Stype.Game_system, game_system_service);


//连接中心数据库的redis
var center_redis_config = game_config.center_redis;
var redis_center = require('../../database/redis_center.js');
redis_center.connect_to_center(center_redis_config.host, center_redis_config.port, center_redis_config.db_index);

//连接游戏数据库
var mysql_game = require('../../database/mysql_game.js');
mysql_game.connect_to_game_server(game_config.game_database.host, game_config.game_database.port,game_config.game_database.db_name,game_config.game_database.uname,game_config.game_database.upwd);

//连接到游戏redis
var game_redis_config = game_config.game_redis;
var redis_game = require('../../database/redis_game.js');
redis_game.connect_to_game(game_redis_config.host, game_redis_config.port, game_redis_config.db_index);




