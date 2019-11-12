// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

/**
 * date: 2019-03-01
 * 飞行棋协议
 */
import utils from "../../utils/utils";
import Stype from "../Stype";

var Cmd = require('Cmd');
var websocket = require('websocket');
var ugame = require('ugame');
var md5 = require('md5');
require('fly_chess_proto');

const {ccclass, property} = cc._decorator;

@ccclass
export default class fly_chess {

    /**
     * 进入区组
     * @param zid 
     */
    public static enter_zone(zid){
        var body = {zid: zid};
        websocket.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_zone, body);
    }

    /**
     * 退出区组
     * @param zid 
     */
    public static exit_zone(zid){
        var body = zid;
        websocket.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Exit_zone, body);
    }

    /**
     * 进入房间
     * @param room_type 房间类型
     */
    public static enter_room(room_type){
        var body = room_type;
        websocket.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_room, body);
    }

    /**
     * 离开房间
     * @param room_type 
     */
    public static exit_room(room_type){
        var body = room_type;
        websocket.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Exit_room, body);
    }

    /**
     * 准备
     */
    public static send_do_ready(){
        var body = null;
        websocket.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Send_do_ready, body);
    }

    /**
     * 摇色子 发送自己想摇到几
     * -1 代表服务器随机
     */
    public static roll_shaizi(num = -1){
        var body = num;
        websocket.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Roll_shaizi, body);
    }

}
