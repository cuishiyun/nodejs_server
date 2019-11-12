/**
 * date: 2019-3-01
 * 飞行棋
 */

/**
 * 防止交叉引用 先导出
 */
module.exports = {
    enter_zone: enter_zone,
    exit_zone: exit_zone,
    enter_room: enter_room,
    exit_room: exit_room,
    send_do_ready: send_do_ready,
    roll_shaizi: roll_shaizi,

};

var Responses = require('../../Responses.js');
var redis_center = require('../../../database/redis_center.js');
var log = require('../../../utils/log.js');
var game_config = require('../../game_config.js');
var fly_chess_player = require('./fly_chess_player.js');
var fly_chess_room = require('./fly_chess_room.js');
var QuitReason = require('../QuitReason.js');
var fly_chess_room_type = require('./fly_chess_room_type.js');

var mysql_game = require('../../../database/mysql_game.js');
var redis_game = require('../../../database/redis_game.js');

var zones = {};//所有的区间   房间id --> zone对应的表  
var player_set = {};//uid -> player  所有的玩家 

function write_err(status, ret_func) {
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

//游戏里的所有玩家
function get_player_by_uid(uid) {
    if (player_set[uid]) {
        return player_set[uid];
    }

    return null;
}

function alloc_player(uid, session, proto_type) {
    if (player_set[uid]) {
        log.warn('alloc_player: user is exist.');
        return player_set[uid];
    }

    //创建一个玩家对象
    var player = new fly_chess_player(uid);
    player.init_session(session, proto_type);
    return player;
}

function delete_player(uid) {
    if (player_set[uid]) {
        player_set[uid].init_session(null, -1);
        player_set[uid] = null;
        delete player_set[uid];
    } else {
        log.warn('delete player: ' + uid + 'is not in game server!');
    }
}

function zone(config) {
    this.config = config;
    this.wait_list = {};//区组的等待列表  uid -> player
    this.room_list = {};//房间列表  id --> room对象
    this.autoinc_roomid = 1;//自增的房间id号
    //...
}

function init_zones() {
    var zones_config = game_config.game_data.fly_chess_zones;
    for (var i in zones_config) {
        var zid = zones_config[i].zid;
        var z = new zone(zones_config[i]);
        zones[zid] = z;
    }
}

init_zones();//启动后就自动初始化区间

function get_uinfo_inredis(uid, zid, player, ret_func) {
    redis_center.get_uinfo_inredis(uid, function (status, data) {
        if (status != Responses.OK) {
            ret_func(status);
            return;
        }

        // data.unick, data.usex, data.uface;
        player.init_uinfo(data);
        player_set[uid] = player;

        player_enter_zone(player, zid, ret_func);
    });
}

function player_enter_zone(player, zid, ret_func) {
    var zone = zones[zid];
    //判断zid的合法性
    if (!zones[zid]) {
        ret_func(Responses.Invalid_zone);
        return;
    }

    //...
    //end

    //检查玩家金币,vip等，是否可以进入这个区间
    if (player.uchip < zone.config.min_chip) {
        ret_func(Responses.Chip_is_notenough);
        return;
    }

    if (player.uvip < zone.config.vip) {
        ret_func(Responses.Vip_limit);
        return;
    }

    // log.warn('^^^^' + JSON.stringify(zone.wait_list), JSON.stringify(player));
    //将player加入等待列表
    player.zid = zid;
    player.room_id = -1;
    zone.wait_list[player.uid] = player;

    var room1_player = 0;
    var room2_player = 0;
    var room3_player = 0;
    var room4_player = 0;
    for(var key in zone.room_list){
        if(zone.room_list[key].room_type == fly_chess_room_type.type_22){
            room1_player++;
        }else if(zone.room_list[key].room_type == fly_chess_room_type.type_24){
            room2_player++;
        }else if(zone.room_list[key].room_type == fly_chess_room_type.type_42){
            room3_player++;
        }else if(zone.room_list[key].room_type == fly_chess_room_type.type_44){
            room4_player++;
        }
    }

    var body = {
        status: Responses.OK,
        zid: zid,
        room1_playerNum: room1_player,
        room2_playerNum: room2_player,
        room3_playerNum: room3_player,
        room4_playerNum: room4_player,
    };
    ret_func(body);
    log.info('player ' + player.uid + ' enter zone ' + zid + ' and add to waitlist');
}

function enter_zone(uid, zid, session, proto_type, ret_func) {
    //获取玩家
    var player = get_player_by_uid(uid);
    if (!player) {
        player = alloc_player(uid, session, proto_type);

        //用户的游戏信息，从数据库读取
        mysql_game.get_game_info_by_uid(uid, function (status, data) {
            if (status != Responses.OK) {
                ret_func(status);
                return;
            }

            if (data.length <= 0) {
                ret_func(Responses.Illegal_account);
                return;
            }

            var ugame_info = data[0];
            if (ugame_info.status != 0) {
                ret_func(Responses.Illegal_account);
                return;
            }

            //uid, uexp, uchip, uvip, status
            player.init_ugame_info(ugame_info);

            get_uinfo_inredis(uid, zid, player, ret_func);//用户信息从redis
        });
    } else {
        if (player.zid != -1 && player.room_id != -1) {
            //断线重连进来的  player已经在房间里了,又重新进区间
            var zone = zones[player.zid];
            var room = zone.room_list[player.room_id];

            //恢复玩家session
            player.init_session(session, proto_type);

            room.do_reconnect(player);//断线重连 把当前房间的游戏进度数据传给客户端,让他回到当前进度
        } else {
            player_enter_zone(player, zid, ret_func);
        }
    }
}

/**
 * 玩家离开房间
 * @param {*} uid 
 * @param {*} quit_reason 
 */
function do_user_quit_room(uid, quit_reason) {
    var player = get_player_by_uid(uid);
    if (!player) {
        return false;
    }

    var zone = zones[player.zid];
    if (!zone) {
        return false;
    }

    var room = zone.room_list[player.room_id];
    if (!room) {
        return false;
    }

    if (quit_reason == QuitReason.UserLostConnect) {//用户断线了
        player.init_session(null, -1);
    }

    if(room.do_exit_room(player, quit_reason) == false){
        return false;
    }else{
        player.room_id = -1;
    }

    //玩家退出房间, 把玩家重新加回区组的等待列表里
    zone.wait_list[player.uid] = player;
    return true;
}

/**
 * 玩家离开
 * @param {*} uid 
 * @param {*} quit_reason 表明玩家主动离开还是掉线或者被踢
 */
function do_user_quit(uid, quit_reason) {
    var player = get_player_by_uid(uid);
    if (!player) {
        return;
    }

    if (quit_reason == QuitReason.UserLostConnect) {//断线离开清理保存在player上的session
        player.init_session(null, -1);
    }

    if (player.zid != -1 && zones[player.zid]) {//玩家在游戏区里面, 从区间里面离开
        var zone = zones[player.zid];
        if (player.room_id != -1) {//玩家在房间里面,从房间退出
            var room = zone.room_list[player.room_id];
            if (room) {
                //如果当前房间正在游戏，就不允许用户退出
                if (!room.do_exit_room(player, quit_reason)) {
                    return;
                }
            } else {
                player.room_id = -1;
            }
            player.zid = -1;
        } else {//从等待列表退出
            if (zone.wait_list[uid]) {
                log.info('player uid = ' + uid + 'remove from waitlist at zid = ' + player.zid);
                player.zid = -1;
                player.room_id = -1;

                zone.wait_list[uid] = null;
                delete zone.wait_list[uid];
            }

        }
    }
    delete_player(uid);

    log.info('player uid = ' + uid + ' exit game_server, reason = ' + quit_reason)
}

function exit_zone(uid, zid, session, proto_type, ret_func) {
    do_user_quit(uid, QuitReason.UserQuit);
    var body = {
        status: Responses.OK,
        zid: zid,
    };
    ret_func(body);
}

//创建一个房间
function alloc_room(zone, room_type) {
    var room = new fly_chess_room(zone.autoinc_roomid++, room_type, zone.config);
    zone.room_list[room.room_id] = room;//房间加入区间里
    return room;
}

//从区间里搜索一个可用的房间
function do_search_room(zone, room_type) {
    var min_empty = 1000000;
    var min_room = null;
    for (var key in zone.room_list) {
        var room = zone.room_list[key];
        if(room.room_type != room_type){
            continue;//房间类型不符合
        }

        var empty_num = room.empty_seat();
        //说明：有可能你有3个人一桌，那么可能需要先找已经有2个人的桌子
        if (empty_num >= 1) {
            if (empty_num < min_empty) {
                min_room = room;
                min_empty = empty_num;
            }
        }
    }

    if (min_room) {
        return min_room;
    }

    min_room = alloc_room(zone, room_type);
    return min_room;
}

// //自动配桌  启动定时器
// function do_assign_room(){
//     //查询等待列表, 看有没有玩家
//     for(var i in zones){//遍历所有的区间  新手场，高手场，大师场
//         var zone = zones[i];
//         for(var key in zone.wait_list){//遍历区间等待列表
//             var player = zone.wait_list[key];

//             var room = do_search_room(zone);
//             if(room){
//                 room.do_enter_room(player);//玩家加入到房间, 通知客户端
//                 zone.wait_list[key] = null;//从等待列表删除
//                 delete zone.wait_list[key];
//             }

//         }

//     }

// }

function enter_room(uid, room_type, session, proto_type, ret_func) {
    var player = get_player_by_uid(uid);
    if (!player) {//玩家不在游戏里
        ret_func(Responses.Invalid_opt);
        return;
    }

    var zid = player.zid;//玩家所在的区组id
    var zone = zones[zid];
    if (!zone) {
        ret_func(Responses.Invalid_opt);
        return;
    }

    if (!zone.wait_list[uid]) {//玩家不在等待列表
        ret_func(Responses.Invalid_opt);
        return;
    }

    var room = do_search_room(zone, room_type);
    if (room) {
        room.do_enter_room(player);
        zone.wait_list[uid] = null;
        delete zone.wait_list[uid];
    }
}

function exit_room(uid, room_type, session, proto_type, ret_func) {
    var player = get_player_by_uid(uid);
    var room_id = -1;
    if(player){
        room_id = player.room_id;
    }

    if(do_user_quit_room(uid, QuitReason.UserQuit)){
        var body = {
            status: Responses.OK,
            room_type: room_type,
            room_id: room_id,
        };
        ret_func(body);
    }

}

function send_do_ready(uid, ret_func){
    var player = get_player_by_uid(uid);
    if(!player || player.zid == -1 || player.room_id == -1){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    var zone = zones[player.zid];
    if(!zone){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    var room = zone.room_list[player.room_id];
    if(!room){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    room.do_player_ready(player, ret_func);
}

function roll_shaizi(uid, wantNum, ret_func){
    var player = get_player_by_uid(uid);
    if(!player || player.zid == -1 || player.room_id == -1){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    var zone = zones[player.zid];
    if(!zone){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    var room = zone.room_list[player.room_id];
    if(!room){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    room.roll_shaizi(player, wantNum, ret_func);
}