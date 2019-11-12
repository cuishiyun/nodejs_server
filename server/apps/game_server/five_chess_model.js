/**
 * date: 2019-02-19
 */

 /**
  * 防止交叉引用 先导出
  */
module.exports = {
    enter_zone: enter_zone,
    user_quit: user_quit,
    user_lost_connect: user_lost_connect,
    send_prop: send_prop,
    send_do_ready: send_do_ready,
    do_player_put_chess: do_player_put_chess,
    kick_user_chip_notenough: kick_user_chip_notenough,
    kick_offline_player: kick_offline_player,
    do_player_get_prev_round_data: do_player_get_prev_round_data,

};

var Responses = require('../Responses.js');
var redis_center = require('../../database/redis_center.js');
var utils = require('../../utils/utils.js');
var log = require('../../utils/log.js');
var phone_msg = require('../phone_msg.js');
var game_config = require('../game_config.js');

var mysql_game = require('../../database/mysql_game.js');
var redis_game = require('../../database/redis_game.js');
var five_chess_player = require('./five_chess_player.js');
var five_chess_room = require('./five_chess_room.js');
var QuitReason = require('./QuitReason.js');

var zones = {};//分区  房间 zid --> zone对应的表
var player_set = {};//uid -> player  所有的玩家 

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
    var player = new five_chess_player(uid);
    player.init_session(session, proto_type);
    return player;
}

function delete_player(uid){
    if(player_set[uid]){
        player_set[uid].init_session(null, -1);
        player_set[uid] = null;
        delete player_set[uid];
    }else{
        log.warn('delete player: ' + uid + 'is not in game server!');
    }
}

function zone(config) {
    this.config = config;
    this.wait_list = {};//玩家的等待列表
    this.room_list = {};//房间列表  一个id对应一个房间
    this.autoinc_roomid = 1;//自增的房间id号
    //...
}

function init_zones() {
    var zones_config = game_config.game_data.five_chess_zones;
    for (var i in zones_config) {
        var zid = zones_config[i].zid;
        var z = new zone(zones_config[i]);
        zones[zid] = z;
    }
}

init_zones();

function write_err(status, ret_func) {
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

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
    if(player.uchip < zone.config.min_chip){
        ret_func(Responses.Chip_is_notenough);
        return;
    }

    if(player.uvip < zone.config.vip){
        ret_func(Responses.Vip_limit);
        return;
    }

    // log.warn('^^^^' + JSON.stringify(zone.wait_list), JSON.stringify(player));
    //将player加入等待列表
    player.zid = zid;
    player.room_id = -1;
    zone.wait_list[player.uid] = player;
    ret_func(Responses.OK);
    log.info('player ' + player.uid + ' enter zone ' + zid + ' and add to waitlist');
}

function enter_zone(uid, zid, session, proto_type, ret_func) {
    //获取玩家
    var player = get_player_by_uid(uid);
    if (!player) {//未找到player
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
        if(player.zid != -1 && player.room_id != -1){
            //断线重连进来的  player已经在房间里了,又重新进区间
            var zone = zones[player.zid];
            var room = zone.room_list[player.room_id];
            
            //恢复玩家session
            player.init_session(session, proto_type);

            room.do_reconnect(player);//断线重连 把当前房间的游戏进度数据传给客户端,让他回到当前进度
        }else{
            player_enter_zone(player, zid, ret_func);
        }
    }


}

/**
 * 执行玩家离开的动作
 * @param {*} uid 
 * @param {*} quit_reason 表明玩家主动离开还是掉线或者被踢
 */
function do_user_quit(uid, quit_reason){
    var player = get_player_by_uid(uid);
    if(!player){
        return;
    }

    if(quit_reason == QuitReason.UserLostConnect){//断线离开清理保存在player上的session
        player.init_session(null, -1);
    }

    if(player.zid != -1 && zones[player.zid]){//玩家在游戏区里面, 从区间里面离开
        var zone = zones[player.zid];
        if(player.room_id != -1){//玩家在房间里面,从房间退出
            var room = zone.room_list[player.room_id];
            if(room){
                //如果当前房间正在游戏，就不允许用户退出
                if(!room.do_exit_room(player, quit_reason)){
                    return;
                }
            }else{
                player.room_id = -1;
            }
            player.zid = -1;
        }else{//从等待列表退出
            if(zone.wait_list[uid]){
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

/**
 * 用户主动离开
 * @param {*} uid 
 * @param {*} ret_func 
 */
function user_quit(uid, ret_func){
    do_user_quit(uid, QuitReason.UserQuit);
    ret_func(Responses.OK);
}

/**
 * 服务器踢人 --金币不足踢人
 * @param {*} uid 
 * @param {*} ret_func 
 */
function kick_user_chip_notenough(uid, ret_func){
    do_user_quit(uid, QuitReason.Chip_is_notenough);
}

/**
 * 踢掉断线的玩家
 * @param {*} uid 
 * @param {*} ret_func 
 */
function kick_offline_player(uid, ret_func){
    do_user_quit(uid, QuitReason.SystemKick);
}

/**
 * 用户网断了
 * @param {*} uid 
 */
function user_lost_connect(uid){
    do_user_quit(uid, QuitReason.UserLostConnect);
}

//创建一个房间
function alloc_room(zone){
    var room = new five_chess_room(zone.autoinc_roomid++, zone.config);
    zone.room_list[room.room_id] = room;//房间加入区间里
    return room;
}

//从区间里搜索一个可用的房间
function do_search_room(zone){
    var min_empty = 1000000;
    var min_room = null;
    for(var key in zone.room_list){
        var room = zone.room_list[key];
        var empty_num = room.empty_seat();
        //说明：有可能你有3个人一桌，那么可能需要先找已经有2个人的桌子
        if(room && empty_num >= 1){
            if(empty_num < min_empty){
                min_room = room;
                min_empty = empty_num;
            }
        }
    }

    if(min_room){
        return min_room;
    }

    min_room = alloc_room(zone);
    return min_room;
}

//自动配桌  启动定时器
function do_assign_room(){
    //查询等待列表, 看有没有玩家
    for(var i in zones){//遍历所有的区间  新手场，高手场，大师场
        var zone = zones[i];
        for(var key in zone.wait_list){//遍历区间等待列表
            var player = zone.wait_list[key];

            var room = do_search_room(zone);
            if(room){
                room.do_enter_room(player);//玩家加入到房间, 通知客户端
                zone.wait_list[key] = null;//从等待列表删除
                delete zone.wait_list[key];
            }

        }

    }

}

setInterval(do_assign_room, 500);//500ms配桌一次

function send_prop(uid, propid, to_seatid, ret_func){
    //金币足够,扣除金币,然后结果给客户端
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

    room.send_prop(player, to_seatid, propid, ret_func);
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

//玩家下棋
function do_player_put_chess(uid, block_x, block_y, ret_func){
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

    room.do_player_put_chess(player, block_x, block_y, ret_func);
}

function do_player_get_prev_round_data(uid, ret_func){
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

    room.do_player_get_prev_round_data(player, ret_func);
}