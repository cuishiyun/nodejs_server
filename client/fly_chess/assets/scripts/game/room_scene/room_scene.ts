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
 * 匹配场景
 */

import fly_chess from "../protobufs/fly_chess";
import Responses from "../Responses";
import Stype from "../Stype";
import room_type from "./room_type";
import chess from '../game_object/chess.js';
import State from "../State";
import chessColor from "../game_object/chess_color";
var websocket = require('websocket');
var Cmd = require('Cmd');
var ugame = require('ugame');

const {ccclass, property} = cc._decorator;

@ccclass
export default class room_scene extends cc.Component {

    @property(cc.Label)
    label_zone_title: cc.Label = null;//标题

    @property(cc.Label)
    label_room_id: cc.Label = null;//房间号

    @property(cc.Label)
    label_self_tips: cc.Label = null;//自己的颜色提示

    private room_type: number = -1;
    private m_room_seat_max: number = -1;//房间人数
    private m_room_chess_max: number = -1;//棋子数量

    @property([chess])
    prefab_chess_blue: chess[] = [];

    @property([chess])
    prefab_chess_red: chess[] = [];

    @property([chess])
    prefab_chess_green: chess[] = [];

    @property([chess])
    prefab_chess_yellow: chess[] = [];

    @property([cc.Label])
    label_ready: cc.Label[] = [];

    @property(cc.Button)
    m_btn_roll: cc.Button = null;//摇的按钮

    @property(cc.Button)
    m_btn_ready: cc.Button = null;//准备按钮

    @property(cc.Label)
    m_label_game_tips: cc.Label = null;//游戏提示

    @property(cc.EditBox)
    m_editbox_wantRollNum: cc.EditBox = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.m_editbox_wantRollNum.string = '-1';
    }

    start () {
        fly_chess.enter_room(ugame.room_type);

        this.room_type = ugame.room_type;
        if(this.room_type == room_type.type_22){
            this.m_room_seat_max = 2;
            this.m_room_chess_max = 2;
        }else if(this.room_type == room_type.type_24){
            this.m_room_seat_max = 2;
            this.m_room_chess_max = 4;
        }else if(this.room_type == room_type.type_42){
            this.m_room_seat_max = 4;
            this.m_room_chess_max = 2;
        }else if(this.room_type == room_type.type_44){
            this.m_room_seat_max = 4;
            this.m_room_chess_max = 4;
        }

        for(var key in this.label_ready){
            this.label_ready[key].node.active = false;
        }

        this.m_btn_roll.node.active = false;
        this.m_label_game_tips.node.active = false;
        //先隐藏掉所有的棋子
        for(var key in this.prefab_chess_red){
            this.prefab_chess_red[key].node.active = false;
            this.prefab_chess_red[key].setColor(chessColor.Color_Red);
        }

        for(var key in this.prefab_chess_yellow){
            this.prefab_chess_yellow[key].node.active = false;
            this.prefab_chess_yellow[key].setColor(chessColor.Color_Yellow);
        }

        for(var key in this.prefab_chess_blue){
            this.prefab_chess_blue[key].node.active = false;
            this.prefab_chess_blue[key].setColor(chessColor.Color_Blue);
        }

        for(var key in this.prefab_chess_green){
            this.prefab_chess_green[key].node.active = false;
            this.prefab_chess_green[key].setColor(chessColor.Color_Green);
        }

        this.label_zone_title.active = false;
        this.label_room_id.active = false;

        var service_handlers = {};
        service_handlers[Stype.GameFlyChess] = this.on_fly_chess_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    }

    // update (dt) {}

    private on_exit_btn_click(): void{
        fly_chess.exit_room(ugame.room_type);
    }

    //摇色子
    private on_roll_btn_click(): void{
        var num = parseInt(this.m_editbox_wantRollNum.string);
        fly_chess.roll_shaizi(num);
    }

    /**
     * 发送准备消息
     */
    private on_send_do_ready_btn_click(): void{
        fly_chess.send_do_ready();
    }

    private on_exit_room_server_return(body){
        ugame.exit_room();
        cc.director.loadScene('room_select_scene');
    }

    private on_enter_room_server_return(body): void{
        if(body.status != Responses.OK){
            return;
        }
        var room_id = body.room_id;
        var room_type = body.room_type;
        ugame.enter_room(room_type);
        ugame.room_id = room_id;

        this.label_zone_title.active = true;
        this.label_room_id.active = true;
        if(this.room_type == 1){
            this.label_zone_title.string = '2人场2个棋子';
        }else if(this.room_type == 2){
            this.label_zone_title.string = '2人场4棋子';
        }else if(this.room_type == 3){
            this.label_zone_title.string = '4人场2个棋子';
        }else if(this.room_type == 4){
            this.label_zone_title.string = '4人场4个棋子';
        }
        this.label_room_id.string = '房间号:' + ugame.room_id;

    }

    private on_sitdown_server_return(body){
        if(body.status != Responses.OK){
            return;
        }

        var seatid = body.seatid;
        ugame.sitdown(seatid);
        this.show_seatid(seatid, true, true);
    }

    private getColorBySeatid(seatid): string{
        var color = '';
        //设置提示标签,筛选颜色
        if(this.m_room_seat_max == 2){
            if(seatid == 0){
                color = 'red';
            }else if(seatid == 1){
                color = 'blue';
            }
        }else if(this.m_room_seat_max == 4){
            if(seatid == 0){
                color = 'red';
            }else if(seatid == 1){
                color = 'yellow';
            }else if(seatid == 2){
                color = 'blue';
            }else if(this.seatid == 3){
                color = 'green';
            }
        }
        return color;
    }

    private show_seatid(seatid: number, is_self: boolean, is_show: boolean): void{
        var color = this.getColorBySeatid(seatid);
        //根据颜色和人数显示棋子
        if(this.m_room_chess_max == 2){
            if(color == 'red'){
                if(is_self){
                    this.label_self_tips.string = '你是红色';
                }
                this.prefab_chess_red[0].node.active = is_show;
                this.prefab_chess_red[1].node.active = is_show;
            }else if(color == 'yellow'){
                if(is_self){
                    this.label_self_tips.string = '你是黄色';
                }
                this.prefab_chess_yellow[0].node.active = is_show;
                this.prefab_chess_yellow[1].node.active = is_show;
            }else if(color == 'blue'){
                if(is_self){
                    this.label_self_tips.string = '你是蓝色';
                }
                this.prefab_chess_blue[0].node.active = is_show;
                this.prefab_chess_blue[1].node.active = is_show;
            }else if(color == 'green'){
                if(is_self){
                    this.label_self_tips.string = '你是绿色';
                }
                this.prefab_chess_green[0].node.active = is_show;
                this.prefab_chess_green[1].node.active = is_show;
            }
        }else if(this.m_room_chess_max == 4){
            //不处理
            if(color == 'red'){
                if(is_self){
                    this.label_self_tips.string = '你是红色';
                }
                this.prefab_chess_red[0].node.active = is_show;
                this.prefab_chess_red[1].node.active = is_show;
                this.prefab_chess_red[2].node.active = is_show;
                this.prefab_chess_red[3].node.active = is_show;
            }else if(color == 'yellow'){
                if(is_self){
                    this.label_self_tips.string = '你是黄色';
                }
                this.prefab_chess_yellow[0].node.active = is_show;
                this.prefab_chess_yellow[1].node.active = is_show;
                this.prefab_chess_yellow[2].node.active = is_show;
                this.prefab_chess_yellow[3].node.active = is_show;
            }else if(color == 'blue'){
                if(is_self){
                    this.label_self_tips.string = '你是蓝色';
                }
                this.prefab_chess_blue[0].node.active = is_show;
                this.prefab_chess_blue[1].node.active = is_show;
                this.prefab_chess_blue[2].node.active = is_show;
                this.prefab_chess_blue[3].node.active = is_show;
            }else if(color == 'green'){
                if(is_self){
                    this.label_self_tips.string = '你是绿色';
                }
                this.prefab_chess_green[0].node.active = is_show;
                this.prefab_chess_green[1].node.active = is_show;
                this.prefab_chess_green[2].node.active = is_show;
                this.prefab_chess_green[3].node.active = is_show;
            }
        }

    }

    private on_user_arrived_server_return(body): void{
        var seatid = body.seatid;
        this.show_seatid(seatid, false, true);
        var state = body.state;
        if(state == State.Ready){
            this.show_ready_forseat(seatid);
        }

    }

    private on_standup_server_return(body): void{
        if(body.status != Responses.OK){
            return;
        }
        
        var seatid = body.seatid;
        var is_self = (seatid == ugame.seatid);
        ugame.standup(seatid);
        this.show_seatid(seatid, is_self, false)
    }

    private show_ready_forseat(seatid){
        //显示玩家已准备
        var color = this.getColorBySeatid(seatid);
        if(color == 'red'){
            this.label_ready[0].node.active = true;
        }else if(color == 'yellow'){
            this.label_ready[1].node.active = true;
        }else if(color == 'blue'){
            this.label_ready[2].node.active = true;
        }else if(color == 'green'){
            this.label_ready[3].node.active = true;
        }
    }

    private on_send_do_ready_server_return(body): void{
        if(body.status != Responses.OK){
            return;
        }

        var seatid = body.seatid;
        if(seatid == ugame.seatid){
            this.m_btn_ready.node.active = false;//是自己
        }
        this.show_ready_forseat(seatid);
    }

    private on_round_start_server_return(body): void{
        for(var key in this.label_ready){
            this.label_ready[key].node.active = false;
        }
    }

    private on_turn_to_player_server_return(body): void{
        var think_time = body.think_time;
        var seatid = body.seatid;
        if(seatid == ugame.seatid){
            this.m_btn_roll.node.active = true;
        }else{
            this.m_btn_roll.node.active = false;
        }

        this.m_label_game_tips.node.active = true;
        var color = this.getColorBySeatid(seatid);
        this.m_label_game_tips.string = '当前轮到: ' + color;

        //出现筛子在该玩家下面 elviscui todo
        
    }

    /**
     * 摇色子结果返回  客户端自己判断起飞还是走步数,传给服务器
     * @param body 
     */
    private on_roll_shaizi_server_return(body): void{
        if(body.state != Responses.OK){
            return;
        }
        this.m_editbox_wantRollNum.string = '-1';

        var seatid = body.seatid;
        var num = body.num;//摇到的点数
        
        var color = this.getColorBySeatid(seatid);
        if(color == 'red'){
            this.prefab_chess_red[0].chessMoveStep(num, true);
        }else if(color == 'yellow'){
            this.prefab_chess_yellow[0].chessMoveStep(num, true);
        }else if(color == 'blue'){
            this.prefab_chess_blue[0].chessMoveStep(num, true);
        }else if(color == 'green'){
            this.prefab_chess_green[0].chessMoveStep(num, true);
        }

    }

    private on_fly_chess_server_return(stype, ctype, body): void{
        switch(ctype){
            case Cmd.GameFlyChess.Enter_room:
            {
                console.log('进入房间 ' + JSON.stringify(body));
                this.on_enter_room_server_return(body);
            }
            break;
           case Cmd.GameFlyChess.Exit_room:
            {
                console.log('退出游戏房间 ' + JSON.stringify(body));
                this.on_exit_room_server_return(body);
            }
           break;
           case Cmd.GameFlyChess.Sitdown:
           {
               console.log('玩家坐下 ' + JSON.stringify(body));
               this.on_sitdown_server_return(body);
           }
           break;
           case Cmd.GameFlyChess.Standup:
           {
               console.log('玩家站起 ' + JSON.stringify(body));
               this.on_standup_server_return(body);
           }
           break;
           case Cmd.GameFlyChess.User_arrived:
           {
               console.log('其他玩家到达 ' + JSON.stringify(body));
               this.on_user_arrived_server_return(body);
           }
           break;
           case Cmd.GameFlyChess.Send_do_ready:
           {
               console.log('玩家准备 ' + JSON.stringify(body));
               this.on_send_do_ready_server_return(body);
           }
           break;
           case Cmd.GameFlyChess.Round_start:
           {
               console.log('游戏开始 ' + JSON.stringify(body));
               this.on_round_start_server_return(body);
           }
           break;
           case Cmd.GameFlyChess.Turn_to_player:
           {
               console.log('轮到玩家 ' + JSON.stringify(body));
               this.on_turn_to_player_server_return(body);
           }
           break;
           case Cmd.GameFlyChess.Roll_shaizi:
           {
               console.log('摇筛子 ' + JSON.stringify(body));
               this.on_roll_shaizi_server_return(body);
           }
           break;
        }
    }

}
