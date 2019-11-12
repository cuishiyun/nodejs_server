/**
 * redis ugame
 * date: 2019-02-15
 */

var redis = require('redis');
var util = require('util');

var log = require('../utils/log.js');
var Responses = require('../apps/Responses.js');
var utils = require('../utils/utils.js');

var game_redis = null;

function connect_to_game(host, port, db_index) {
    //创建client连接到redis server
    game_redis = redis.createClient({
        host: host,
        port: port,
        db: db_index,
    });

    //监听error事件, 自动重新连接服务器
    game_redis.on('error', function(err){
        log.info('redis client err = ' + err);
    });

    game_redis.on('end', function(){
        log.info('服务器断开连接');
    });

    //连接上服务器
    game_redis.on('ready', function(){
        log.info('redis ready');
    });

}

/**
 * key ---> value
 * bycw_center_user_uid_1234
 * uinfo: {
 *     unick: string,
 *     uface: int,
 *     usex: int,
 *     uvip: int,
 *     is_guest: int,// 0/1
 * }
 * @param {*} uid 
 * @param {*} uinfo 
 */
function set_ugame_inredis(uid, ugame){
    if(game_redis === null){
        return;
    }

    var key = 'bycw_game_user_uid_' + uid;
    ugame.uchip = ugame.uchip.toString();
    ugame.uexp = ugame.uexp.toString();
    ugame.uvip = ugame.uvip.toString();

    log.info('redis center hmset ' + key);
    //hash  用户表
    game_redis.hmset(key, ugame, function(err){
        if(err){
            log.info(err);
        }
    });

}

// callback (status, body)
function get_ugame_inredis(uid, callback){
    if(game_redis === null){
        callback(Responses.System_error, null);
        return;
    }

    var key = 'bycw_game_user_uid_' + uid;
    log.info('hgetall ' + key);

    game_redis.hgetall(key, function(err, data){
        if(err){
            callback(Responses.System_error, null);
            return;
        }

        var ugame = data;
        ugame.uchip = parseInt(ugame.uchip);
        ugame.uexp = parseInt(ugame.uexp);
        ugame.uvip = parseInt(ugame.uvip);

        callback(Responses.OK, ugame);
    });

}

function update_game_world_rank(rank_name, uid, uchip){
    game_redis.zadd(rank_name, uchip, '' + uid);//把数据加入redis
}

function get_world_rank_info(rank_name, rank_min, rank_max, callback){
    //从大到小
    game_redis.zrevrange(rank_name, rank_min, rank_max, 'withscores', function(err, data){
        if(err){
            callback(Responses.System_error, null);
            return;
        }

        if(!data || data.length <= 0){
            callback(Responses.Rank_is_empty, null);
            return;
        }

        log.info('zrevrange, rank_na1me = ' + rank_name + ',data = ' + data);
        //[uid, uchip] -> redis中的都是字符串  [uid, uchip, uid, uchip]
        for(var i=0; i < data.length; i++){
            data[i] = parseInt(data[i]);
        }
        callback(Responses.OK, data);
    });
}

function add_ugame_uchip(uid, uchip, is_add){
    get_ugame_inredis(uid, function(status, ugame_info){
        if(status != Responses.OK){
            return;
        }

        if(!is_add){
            uchip = -uchip;
        }

        ugame_info.uchip += uchip;
        set_ugame_inredis(uid, ugame_info);
    });
}

module.exports = {
    connect_to_game: connect_to_game,
    set_ugame_inredis: set_ugame_inredis,
    get_ugame_inredis: get_ugame_inredis,
    update_game_world_rank: update_game_world_rank,
    get_world_rank_info: get_world_rank_info,
    add_ugame_uchip: add_ugame_uchip,

};