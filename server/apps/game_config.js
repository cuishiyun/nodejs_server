/**
 * 游戏配置
 */

var Stype = require('./Stype.js');
var HOST_IP = '127.0.0.1';
var mysql_root_password = '123456';

/**
 * 需要对外开放的端口: 
 * 3306,//用于mysql客户端远程连接
 * 10001,//web服务器
 * 6080,//tcp socket
 * 6081,//webspclet
 * 6086,//中心服务器（登录）
 * 6087,//系统服务器（奖励和排行榜）
 * 6088,//五子棋游戏服务器端口
 * 6089,//飞行棋游戏服务器端口
 * 
 * 
 * 内部使用的端口:
 * 6379,//redis
 * 
 */

var game_config = {
    // 39.96.197.173
    GATEWAY_CONNECT_IP: '127.0.0.1',//网关所在的ip

    //网关配置
    gateway_config: {
        host: HOST_IP,
        ports: [6080, 6081],//6080: tcp  6081: websocket
    },

    //web服务器
    webserver: {
        host: HOST_IP,
        port: 10001,
    },

    //系统服务器
    game_system_server: {
        host: HOST_IP,
        port: 6087,
        stypes: [Stype.Game_system],//这个服务器支撑的服务
    },

    //中心服务器
    center_server: {
        host: HOST_IP,
        port: 6086,
        stypes: [Stype.Auth],//这个服务器支撑的服务
    },

    //游戏服务器
    game_server: {
        host: HOST_IP,
        port: 6088,
        stypes: [Stype.Game5Chess],//这个服务器支撑的服务

        //五子棋游戏
        fly_chess: {
            host: HOST_IP,
            port: 6089,
            stypes: [Stype.GameFlyChess],//这个服务器支撑的服务
        }

    },


    //游戏数据库
    game_database: {
        host: HOST_IP,
        port: 3306,
        db_name: 'bycw_game_node',
        uname: 'root',
        upwd: mysql_root_password,
    },

    //游戏redis
    game_redis: {
        host: HOST_IP,
        port: 6379,
        db_index: 1,
    },

    //中心数据库
    center_database: {
        host: HOST_IP,
        port: 3306,
        db_name: 'bycw_center',
        uname: 'root',
        upwd: mysql_root_password,
    },

    //中心redis
    center_redis: {
        host: HOST_IP,
        port: 6379,
        db_index: 0,
    },

    //游戏服务 --- gateway连接其他的服务器  可以通过代码来生成
    gw_connect_servers: {
        /*//聊天服务
        '聊天服务器': {
            stype: Stype.TalkRoom,
            host: HOST_IP,
            port: 6084,
        },*/
        //登录服务
        'auth': {
            stype: Stype.Auth,
            host: HOST_IP,
            port: 6086,
        },

        'game_system': {
            stype: Stype.Game_system,
            host: HOST_IP,
            port: 6087,
        },

        3: {
            stype: Stype.Game5Chess,
            host: HOST_IP,
            port: 6088,
        },

        'GameFlyChess': {
            stype: Stype.GameFlyChess,
            host: HOST_IP,
            port: 6089,
        },

    },

    //游戏注册时候的初始数据  经验, 金币
    game_data: {
        first_uexp: 1000,
        first_uchip: 1000,

        //登陆奖励
        login_bonues_config: {
            bonues: [100, 200, 300, 400, 500],//后面都是奖励500
            clear_login_straight: false,//是否清除连续登陆
        },

        //离线生成： 1: 写入数据库   2: 脚本遍历数据库生成json  3: 代码加载配置文件
        //为什么不实时的加载这个配置呢?  
        five_chess_zones: {
            0: { zid: 1, name: '新手场', vip_level: 0, min_chip: 100, one_round_chip: 3, think_time: 15 },
            1: { zid: 2, name: '高手场', vip_level: 0, min_chip: 5000, one_round_chip: 10, think_time: 10 },
            2: { zid: 3, name: '大师场', vip_level: 0, min_chip: 10000, one_round_chip: 16, think_time: 10 },
        },

        //飞行棋区间
        fly_chess_zones: {
            0: { zid: 1, name: '新手场', vip_level: 0, min_chip: 100, one_round_chip: 3, think_time: 15 },
            1: { zid: 2, name: '高手场', vip_level: 0, min_chip: 5000, one_round_chip: 10, think_time: 10 },
            2: { zid: 3, name: '大师场', vip_level: 0, min_chip: 10000, one_round_chip: 16, think_time: 10 },
        },

    },

};

module.exports = game_config;
