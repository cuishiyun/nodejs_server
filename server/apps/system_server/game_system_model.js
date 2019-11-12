/**
 * date: 2019-02-15
 */
var _RANK_NAME_ = 'NODE_GAME_WORLD_RANK';

var Responses = require('../Responses.js');
var redis_center = require('../../database/redis_center.js');
var utils = require('../../utils/utils.js');
var log = require('../../utils/log.js');
var phone_msg = require('../phone_msg.js');
var game_config = require('../game_config.js');

var mysql_game = require('../../database/mysql_game.js');
var redis_game = require('../../database/redis_game.js');

var login_bonues_config = game_config.game_data.login_bonues_config;

function write_err(status, ret_func) {
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

function check_login_bonues_info(uid) {
    //检查有没有登陆奖励信息
    mysql_game.get_login_bonues_info(uid, function (status, data) {
        if (status != Responses.OK) {
            return;
        }

        if (data.length <= 0) {//未找到, 插入一个，发放奖励
            var tempBonues = login_bonues_config.bonues[0];//默认的奖励
            mysql_game.insert_user_login_bonues(uid, tempBonues, function (status) {
                return;
            });

        } else {
            var sql_login_bonues = data[0];
            //days, bonues_time
            var has_bonues = sql_login_bonues.bonues_time <= utils.timestamp_today();
            if(has_bonues){//更新本次登陆奖励
                //计算连续登陆的天数
                var days = 1;
                var is_straight = sql_login_bonues.bonues_time >= utils.timestamp_yesterday();
                if(is_straight){//连续登陆
                    days = sql_login_bonues.days + 1;
                }

               var index = days - 1;
               if(days > login_bonues_config.bonues.length){//
                    if(login_bonues_config.clear_login_straight){//重新计数
                        days = 1;
                        index = 0;
                    }else{
                        index = login_bonues_config.bonues.length - 1;
                    }
               }

               //发放今天的奖励
               var bonues = login_bonues_config.bonues[index];
               mysql_game.update_user_login_bonues(uid, bonues, days, function(status){

               });

            }

        }

    });
}

//获取游戏服务器的信息success
function get_ugame_info_success(uid, data, ret_func) {
    // log.warn('data = ' + JSON.stringify(data));

    var ret = {};
    ret.status = Responses.OK;
    ret.uchip = data.uchip;
    ret.uvip = data.uvip;
    ret.uexp = data.uexp;

    redis_game.set_ugame_inredis(uid, {
        uchip: data.uchip,
        uexp: data.uexp,
        uvip: data.uvip,
    });

    //刷新世界排行榜 'NODE_GAME_WORLD_RANK'
    redis_game.update_game_world_rank(_RANK_NAME_, uid, data.uchip);

    /**
     * 检查是否要发放登陆奖励
     */
    check_login_bonues_info(uid);

    ret_func(ret);
}

function get_game_info(uid, ret_func) {
    //查询数据库有无用户
    mysql_game.get_game_info_by_uid(uid, function (status, data) {
        if (status != Responses.OK) {
            write_err(status, ret_func);
            return;
        }

        if (data.length <= 0) {//未找到
            mysql_game.insert_ugame_user(uid, game_config.game_data.first_uexp, game_config.game_data.first_uchip, function (status) {
                if (status != Responses.OK) {
                    write_err(status, ret_func);
                    return;
                }

                get_game_info(uid, ret_func);
            });

        } else {
            var sql_ugame = data[0];

            if (sql_ugame.status != 0) {//被封号
                write_err(Responses.Illegal_account, ret_func);
                return;
            }

            get_ugame_info_success(uid, sql_ugame, ret_func);
        }

    });
}

function get_bonues_info_success(uid, has_bonues, data, ret_func){
    var ret = {};
    ret['0'] = Responses.OK;
    ret['1'] = has_bonues;
    if(has_bonues != 1){
        ret_func(ret);
        return;
    }

    ret['2'] = data.id;
    ret['3'] = data.bonues;
    ret['4'] = data.days;

    ret_func(ret);
}

function get_login_bonues_info(uid, ret_func){
    mysql_game.get_login_bonues_info_by_uid(uid, function(status, data){
        if (status != Responses.OK) {
            write_err(status, ret_func);
            return;
        }

        if (data.length <= 0) {//未找到
            get_bonues_info_success(uid, 0, null, ret_func);
        } else {
            var sql_bonues_info = data[0];

            if (sql_bonues_info.status != 0) {//奖励已经被领取
                get_bonues_info_success(uid, 0, null, ret_func);
                return;
            }

            get_bonues_info_success(uid, 1, sql_bonues_info, ret_func);
        }

    });
}

function recv_login_bonues_success(uid, bonues_id, bonues, ret_func){
    //更新数据库,奖励标记为已经领取
    mysql_game.update_login_bonues_recved(bonues_id);
    //更新玩家数据库中的金币数
    mysql_game.add_ugame_uchip(uid, bonues, true);

    //更新game redis
    redis_game.get_ugame_inredis(uid, function(status, ugame_info){
        if(status != Responses.OK){
            log.error('redis game get ugame info failed!');
            return;
        }

        ugame_info.uchip = ugame_info.uchip + bonues;
        redis_game.set_ugame_inredis(uid, ugame_info);//保存进redis
    });

    var ret = {
        0: Responses.OK,
        1: bonues,
    };

    ret_func(ret);
}

//领取登录奖励
function recv_login_bonues(uid, bonues_id, ret_func){
    //查询登录奖励的合法性
    mysql_game.get_login_bonues_info_by_uid(uid, function(status, data){
        if (status != Responses.OK) {
            write_err(status, ret_func);
            return;
        }

        // log.warn('~~ data = ' + JSON.stringify(data) + 'bonues_id = ' + bonues_id);
        if (data.length <= 0) {//未找到
            write_err(Responses.Invalid_opt, ret_func);
        } else {
            var sql_bonues_info = data[0];

            if (sql_bonues_info.status != 0) {//奖励已经被领取
                write_err(Responses.Invalid_opt, ret_func);
                return;
            }

            if(sql_bonues_info.id != bonues_id){//查到的id跟客户端上传的id不一致
                write_err(Responses.Invalid_opt, ret_func);
                return;
            }

            //发放奖励, 更新金币的数目
            recv_login_bonues_success(uid, bonues_id, sql_bonues_info.bonues, ret_func);
        }

    });

}

function get_rank_info_success(my_rank, rank_array, ret_func){
    var ret = {};
    ret[0] = Responses.OK;
    ret[1] = rank_array.length;
    ret[2] = rank_array;
    ret[3] = my_rank;

    ret_func(ret);
}

function get_players_rank_info(my_uid, data, ret_func){
    var is_sended = false;
    var loaded = 0;
    var my_rank = -1;

    //data此时为 [uid, uchip, uid, uchip, uid, uchip, uid, uchip]
    var rank_array = [];
    var total_len = Math.floor(data.length / 2);
    for(var i = 0; i < total_len; i++){
        rank_array[i] = [];//unick, usex, uface, uchip
    }

    var call_func = function(uid, uchip, out_array, ret_func){
        redis_center.get_uinfo_inredis(uid, function(status, redis_data){
            if(status != Responses.OK){
                if(is_sended == false){
                    write_err(status, ret_func);
                    is_sended = true;
                }
                return;
            }

            out_array.push(redis_data.unick);
            out_array.push(redis_data.usex);
            out_array.push(redis_data.uface);
            out_array.push(uchip);
            loaded++;

            if(loaded >= total_len){
                get_rank_info_success(my_rank, rank_array, ret_func);
                return;
            }
        });
    }

    //获取每个在榜的玩家的信息 redis_center中去获取unick, usex, uface
    for(var i = 0; i < data.length; i += 2){
        if(my_uid == data[i]){
            my_rank = (i/2 + 1);// i/2
        }
        call_func(data[i], data[i + 1], rank_array[i/2], ret_func);
    }
}

function get_world_rank_info(uid, ret_func){
    redis_game.get_world_rank_info(_RANK_NAME_, 0, 30, function(status, data){
        if(status != Responses.OK){
            log.error('redis get_world_rank_info failed!');
            write_err(status, ret_func);
            return;
        }

        //data此时为 [uid, uchip, uid, uchip, uid, uchip, uid, uchip]
        get_players_rank_info(uid, data, ret_func);
    });
    
}

module.exports = {
    get_game_info: get_game_info,
    get_login_bonues_info: get_login_bonues_info,
    recv_login_bonues: recv_login_bonues,
    get_world_rank_info: get_world_rank_info,

};