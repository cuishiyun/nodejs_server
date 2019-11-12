/**
 * date: 2019-02-19
 */

require('../../init.js');
var game_config = require('../game_config.js');
var netbus = require("../../netbus/netbus.js");
var proto_man = require('../../netbus/proto_man.js');
var service_manager = require('../../netbus/service_manager.js');
var Stype = require('../Stype.js');

//开启五子棋服务socket
var game_server = game_config.game_server;
netbus.start_tcp_server(game_server.host, game_server.port, false);

//注册五子棋服务
var five_chess_service = require('./five_chess_service.js');
service_manager.register_service(Stype.Game5Chess, five_chess_service);

//开启飞行棋服务socket
var game_server_fly_chess = game_config.game_server.fly_chess;
netbus.start_tcp_server(game_server_fly_chess.host, game_server_fly_chess.port, false);

//注册飞行棋服务
var fly_chess_service = require('./fly_chess/fly_chess_service.js');
service_manager.register_service(Stype.GameFlyChess, fly_chess_service);


//database
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




