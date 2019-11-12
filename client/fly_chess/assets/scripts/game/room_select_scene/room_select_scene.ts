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
 * 选择房间场景
 */

 var websocket = require('websocket');
 var Cmd = require('Cmd');
 var ugame = require('ugame');
import fly_chess from "../protobufs/fly_chess";
import Stype from "../Stype";
import Responses from "../Responses";

const {ccclass, property} = cc._decorator;

@ccclass
export default class room_select_scene extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    @property(cc.Label)
    label_room1_playerNum: cc.Label = null;

    @property(cc.Label)
    label_room2_playerNum: cc.Label = null;

    @property(cc.Label)
    label_room3_playerNum: cc.Label = null;

    @property(cc.Label)
    label_room4_playerNum: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var service_handlers = {};
        service_handlers[Stype.GameFlyChess] = this.on_fly_chess_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    }

    start () {
        this.label_room1_playerNum.string = '当前人数:' + ugame.room1_playerNum;
        this.label_room2_playerNum.string = '当前人数:' + ugame.room2_playerNum;
        this.label_room3_playerNum.string = '当前人数:' + ugame.room3_playerNum;
        this.label_room4_playerNum.string = '当前人数:' + ugame.room4_playerNum;
    }

    // update (dt) {}

    //2个人 2个棋
    private on_2_2_click(): void{
        ugame.enter_room(1);
        cc.director.loadScene('room_scene');
    }

    //2个人 4个棋
    private on_2_4_click(): void{
        ugame.enter_room(2);
        cc.director.loadScene('room_scene');
    }

    //4个人 2个棋
    private on_4_2_click(): void{
        ugame.enter_room(3);
        cc.director.loadScene('room_scene');
    }

    //4个人 4个棋
    private on_4_4_click(): void{
        ugame.enter_room(4);
        cc.director.loadScene('room_scene');
    }

    private on_exit_zone_click(): void{
        fly_chess.exit_zone(ugame.zid);
    }

    private on_exit_zone_server_return(body): void{
        if(body.status != Responses.OK){
            return;
        }

        var zid = body.zid;
        ugame.exit_zone(zid);
        cc.director.loadScene('zone_scene');
    }


    /**
     * 飞行棋游戏服务器返回
     * @param stype 
     * @param ctype 
     * @param body 
     */
    public on_fly_chess_server_return(stype, ctype, body){
        switch(ctype){
            case Cmd.GameFlyChess.Exit_zone:
            {
                console.log('退出游戏区间 ' + JSON.stringify(body));
                this.on_exit_zone_server_return(body);
            }
            break;
        }
    }

}
