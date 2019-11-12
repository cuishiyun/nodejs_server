/**
 * system
 */
var utils = require('utils');
var Stype = require('Stype');
var Cmd = require('Cmd');
var websocket = require('websocket');
var ugame = require('ugame');
var md5 = require('md5');
require('game_system_proto');

//登录游戏服务器
function get_game_info(){
    var body = null;
    websocket.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_game_info, body);
}

function get_login_bonues_today(){
    var body = null;
    websocket.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_login_bonues, body);
}

function send_recv_login_bonues(bonues_id){
    // var body = {
    //     0: bonues_id,
    // };
    var body = bonues_id;
    websocket.send_cmd(Stype.Game_system, Cmd.GameSystem.Recv_login_bonues, body);
}

function get_world_rank_info(){
    var body = null;
    websocket.send_cmd(Stype.Game_system, Cmd.GameSystem.Get_world_rank_info, body);
}

var system = {
    get_game_info: get_game_info,
    get_login_bonues_today: get_login_bonues_today,
    send_recv_login_bonues: send_recv_login_bonues,
    get_world_rank_info: get_world_rank_info,

};

module.exports = system;