/**
 * date: 2019-02-20
 * 五子棋协议
 */
var utils = require('utils');
var Stype = require('Stype');
var Cmd = require('Cmd');
var websocket = require('websocket');
var ugame = require('ugame');
var md5 = require('md5');
require('five_chess_proto');

function enter_zone(zid){
    var body = zid;
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Enter_zone, body);
}

function user_exit(){
    var body = null;
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.User_Quit, body);
}

function send_prop(to_searid, propid){
    var body = {
        0: propid,
        1: to_searid,
    };
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Send_prop, body);
}

//玩家准备
function send_do_ready(){
    var body = null;
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Send_do_ready, body);
}

function send_put_chess(block_x, block_y){
    var body = {
        0: block_x,
        1: block_y,
    };
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Put_chess, body);
}

function send_get_prev_round(){
    var body = null;
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Get_prev_round, body);
}

var system = {
    enter_zone: enter_zone,
    user_exit: user_exit,
    send_prop: send_prop,
    send_do_ready: send_do_ready,
    send_put_chess: send_put_chess,
    send_get_prev_round: send_get_prev_round,

};

module.exports = system;