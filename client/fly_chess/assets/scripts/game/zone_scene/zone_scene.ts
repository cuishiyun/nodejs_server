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
 * date: 2019-03-04
 * 区组场景
 */

var websocket = require('websocket');
var Cmd = require('Cmd');
var ugame = require('ugame');
import fly_chess from "../protobufs/fly_chess";
import Stype from "../Stype";
import Responses from "../Responses";

const {ccclass, property} = cc._decorator;

@ccclass
export default class zone_scene extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var service_handlers = {};
        service_handlers[Stype.GameFlyChess] = this.on_fly_chess_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    }

    start () {

    }

    // update (dt) {}

    private on_xinshou_btn_click(): void{
        fly_chess.enter_zone(1);
    }

    private on_gaoshou_btn_click(): void{
        fly_chess.enter_zone(2);
    }

    private on_dashi_btn_click(): void{
        fly_chess.enter_zone(3);
    }

    private on_exit_btn_click(): void{
        cc.director.loadScene('loading');
    }

    private on_enter_room_server_return(body){
        if(body.status != Responses.OK){
            console.log('进入区间错误');
            return;
        }
        var zid = body.zid;
        ugame.enter_zone(zid, body['room1_playerNum'], body['room2_playerNum'], body['room3_playerNum'], body['room4_playerNum']);
        cc.director.loadScene('room_select_scene');
    }

       /**
     * 飞行棋游戏服务器返回
     * @param stype 
     * @param ctype 
     * @param body 
     */
    public on_fly_chess_server_return(stype, ctype, body){
        switch(ctype){
            case Cmd.GameFlyChess.Enter_zone:
            {
                console.log('玩家进入区间 ' + JSON.stringify(body));
                this.on_enter_room_server_return(body);
            }
            break;
        }
    }

}
