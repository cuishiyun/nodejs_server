/**
 * redis 中心服务器
 * date: 2019-02-14
 */

var redis = require('redis');
var util = require('util');

var log = require('../utils/log.js');
var Responses = require('../apps/Responses.js');
var utils = require('../utils/utils.js');

var center_redis = null;

function connect_to_center(host, port, db_index) {
    //创建client连接到redis server
    center_redis = redis.createClient({
        host: host,
        port: port,
        db: db_index,
    });

    //监听error事件, 自动重新连接服务器
    center_redis.on('error', function(err){
        log.info('redis client err = ' + err);
    });

    center_redis.on('end', function(){
        log.info('服务器断开连接');
    });

    //连接上服务器
    center_redis.on('ready', function(){
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
function set_uinfo_inredis(uid, uinfo){
    if(center_redis === null){
        return;
    }

    var key = 'bycw_center_user_uid_' + uid;
    uinfo.uface = uinfo.uface.toString();
    uinfo.usex = uinfo.usex.toString();
    uinfo.uvip = uinfo.uvip.toString();
    uinfo.is_guest = uinfo.is_guest.toString();

    log.info('redis center hmset ' + key);
    //hash  用户表
    center_redis.hmset(key, uinfo, function(err){
        if(err){
            log.info(err);
        }
    });

}

// callback (status, body)
function get_uinfo_inredis(uid, callback){
    if(center_redis === null){
        callback(Responses.System_error, null);
        return;
    }

    var key = 'bycw_center_user_uid_' + uid;
    log.info('hgetall ' + key);

    center_redis.hgetall(key, function(err, data){
        if(err){
            callback(Responses.System_error, null);
            return;
        }

        var uinfo = data;
        uinfo.uface = parseInt(uinfo.uface);
        uinfo.usex = parseInt(uinfo.usex);
        uinfo.uvip = parseInt(uinfo.uvip);
        uinfo.is_guest = parseInt(uinfo.is_guest);

        callback(Responses.OK, uinfo);
    });

}

module.exports = {
    connect_to_center: connect_to_center,
    set_uinfo_inredis: set_uinfo_inredis,
    get_uinfo_inredis: get_uinfo_inredis,

};