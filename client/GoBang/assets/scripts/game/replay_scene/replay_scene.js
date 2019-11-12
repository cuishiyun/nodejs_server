// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var five_chess = require('five_chess');
var ugame = require('ugame');
var websocket = require('websocket');
var Stype = require('Stype');
var Cmd = require('Cmd');
var Responses = require('Responses');
var game_seat = require('game_seat');
var State = require('State');

cc.Class({
    extends: cc.Component,

    properties: {
        seatA: {
            type: game_seat,
            default: null,
        },

        seatB: {
            type: game_seat,
            default: null,
        },

        prop_prefab: {
            type: cc.Prefab,
            default: null,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.checkout = this.node.getChildByName('root_node').getChildByName('checkout').getComponent('checkout');
        this.disk = this.node.getChildByName('root_node').getChildByName('chessbox').getComponent('chess_disk');

        var service_handlers = {};
        service_handlers[Stype.Game5Chess] = this.on_game_server_return.bind(this);
        service_handlers[Stype.Broadcast] = this.on_boradcast_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    },

    start () {
        var pre_round = ugame.prev_round_data;
        //座位信息 坐下
        var seats_data = pre_round[0];
        this.on_user_arrived(seats_data[0], true);
        this.on_user_arrived(seats_data[1], false);
        

        // five_chess.enter_zone(ugame.zid);
    },

    // update (dt) {},

    on_close_btn_click: function(){
        //玩家主动退出游戏
        five_chess.user_exit();
    },

    on_enter_zone_return: function(body){
        if(body != Responses.OK){
            return;
        }

        console.log('进入游戏房间');
    },

    on_enter_room_return: function(body){
        if(body['0'] != Responses.OK){
            return;
        }

        console.log('on_enter_room_return, body = ' + JSON.stringify(body));
    },
    
    on_sitdown_return: function(body){
        if(body['0'] != Responses.OK){
            return;
        }

        var sv_seatid = body['1'];

        var player_info = {
            unick: ugame.unick,
            usex: ugame.usex,
            uface: ugame.uface,

            uvip: ugame.user_game_info.uvip,
            uchip: ugame.user_game_info.uchip,
            uexp: ugame.user_game_info.uexp,

            sv_seatid: sv_seatid,

            state: State.InView,

            is_self: true,
        };
        this.seatA.on_sitdown(player_info);
        console.log('玩家坐下, body = ' + JSON.stringify(body));
    },

    on_standup_return: function(body){
        if(body['0'] != Responses.OK){
            return;
        }

        var sv_seatid = body['1'];
        console.log('玩家站起, body = ' + JSON.stringify(body));
        
        if(this.seatA.get_sv_seatid() == sv_seatid){
            //A站起
            this.seatA.on_standup();
        }else if(this.seatB.get_sv_seatid() == sv_seatid){
            //B站起
            this.seatB.on_standup();
        }
        
    },

    on_user_arrived: function(body){
        console.log('其他人来了');
        var player_info = {
            sv_seatid: body['0'],

            unick: body['1'],
            usex: body['2'],
            uface: body['3'],

            uchip: body['4'],
            uexp: body['5'],
            uvip: body['6'],

            is_self: false,

            state: body[7],
        };

        this.seatB.on_sitdown(player_info);
    },
    
    on_send_prop: function(body){
        if(body[0] != Responses.OK){
            return;
        }

        //创建道具
        console.log('玩家发送道具 ' + body[3] + ' from ' + body[1] + ' to ' + body[2]);
        var prop = cc.instantiate(this.prop_prefab);
        this.node.addChild(prop);
        var prop_com = prop.getComponent('game_prop');

        var src_pos;
        var dst_pos;
        if(body[1] == this.seatA.get_sv_seatid()){
            //自己发给别人
            src_pos = this.seatA.node.getPosition();
            dst_pos = this.seatB.node.getPosition();
        }else if(body[1] == this.seatB.get_sv_seatid()){
            //别人发给自己
            src_pos = this.seatB.node.getPosition();
            dst_pos = this.seatA.node.getPosition();
        }
        prop_com.play_prop_anim(src_pos, dst_pos, body[3]);

    },

    on_player_do_ready: function(body){
        if(body[0] != Responses.OK){
            return;
        }

        //玩家准备好
        if(this.seatA.get_sv_seatid() == body[1]){
            //自己准备好
            this.seatA.on_do_ready();
        }else if(this.seatB.get_sv_seatid() == body[1]){
            //对家准备好
            this.seatB.on_do_ready();
        }

    },

    on_game_start: function(body){
        console.log('开始游戏 ' + JSON.stringify(body));
        //开始游戏之前的清理工作
        //end

        this.seatA.on_game_start(body);
        this.seatB.on_game_start(body);
    },

    turn_to_player: function(body){
        if(!body){
            return;
        }
        console.log('轮到玩家 ' + body[1]);
        var action_time = body[0];
        var sv_seatid = body[1];
        if(sv_seatid == this.seatA.get_sv_seatid()){//轮到自己
            this.seatA.turn_to_player(action_time);
            this.disk.set_your_turn(true);
        }else  if(sv_seatid == this.seatB.get_sv_seatid()){
            this.seatB.turn_to_player(action_time);
            this.disk.set_your_turn(false);
        }

    },

    player_put_chess: function(body){
        console.log('玩家下棋 ' + JSON.stringify(body));
        if(body[0] != Responses.OK){
            return;
        }

        //下棋成功了

        var block_x = body[1];
        var block_y = body[2];
        var chess_type = body[3];
        this.disk.put_chess_at(chess_type, block_x, block_y);

        //隐藏玩家进度条 
        this.seatA.hide_timebar();
        this.seatB.hide_timebar();
    },

    on_checkout: function(body){
        console.log('游戏结算' + JSON.stringify(body));
        var winner_seatid = body[0];
        var score = body[1];
        if(winner_seatid == -1){
            //平局
            this.checkout.show_checkout_result(2, 0);
        }else if(winner_seatid == this.seatA.get_sv_seatid()){
            //自己赢了
            this.checkout.show_checkout_result(1, score);
            ugame.user_game_info.uchip += score;//修改金币数
        }else if(winner_seatid == this.seatB.get_sv_seatid()){
            //自己输了
            this.checkout.show_checkout_result(0, score);
            ugame.user_game_info.uchip -= score;
        }
    },

    on_checkout_over: function(body){
        console.log('结算结束 ' + JSON.stringify(body));
        //隐藏结算界面
        this.checkout.hide_checkout_result();
        //清理座位
        this.seatA.on_checkout_over();
        this.seatB.on_checkout_over();
        //清理棋盘
        this.disk.clear_disk();
        //准备按钮重新显示
    },

    do_reconnect: function(body){
        console.log('断线重连 ' + JSON.stringify(body));
        var sv_seatid = body[0];//自己的座位号
        var seat_b_data = body[1][0];
        var round_start_info = body[2];
        var chess_data = body[3];
        var game_ctrl = body[4];

        //玩家自己坐下
        this.on_sitdown_return({
            0: Responses.OK,
            1: sv_seatid
        });

        //对家抵达
        this.on_user_arrived(seat_b_data);

        //开局信息
        this.on_game_start(round_start_info);

        //棋盘数据 x,y  x = j, y = i
        for(var i = 0; i < 15; i++){//行
            for(var j = 0; j < 15; j++){//列
                if(chess_data[i * 15 + j] != 0){
                    this.disk.put_chess_at(chess_data[i * 15 + j], j, i);
                }
            }
        }

        //当前轮到的玩家
        var cur_seatid = game_ctrl[0];
        var left_time = game_ctrl[1];
        if(cur_seatid == -1){
            return;
        }

        if(cur_seatid == this.seatA.get_sv_seatid()){
            //轮到自己
            this.seatA.turn_to_player(left_time);
            this.disk.set_your_turn(true);
        }else{
            this.seatB.turn_to_player(left_time);
            this.disk.set_your_turn(false);
        }
        //end
    },

    on_get_prev_round: function(body){
        console.log('获取上局回顾 ' + JSON.stringify(body));
        if(body[0] != Responses.OK){
            return;
        }

        //先离开房间,再观看回放
        this.on_user_quit();

        websocket.register_serivces_handler(null);

        ugame.prev_round_data = body[1];
        cc.director.loadScene('replay_scene');

    },

    on_user_quit: function() {
        five_chess.user_exit();
    },

    on_game_server_return: function(stype, ctype, body){
        // console.log('on_game_server_return ' + stype + ' ' + ctype + ' ' + JSON.stringify(body));
        switch(ctype){
            case Cmd.Game5Chess.Enter_zone://进入游戏区
            {
                this.on_enter_zone_return(body);
            }
            break;
            case Cmd.Game5Chess.User_Quit:
            {//退出区
                console.log('user exit success. body = ' + JSON.stringify(body));
                if(body != Responses.OK){
                    return;
                }
                cc.director.loadScene('home_scene');
            }
            break;
            case Cmd.Game5Chess.Enter_room:
            {//进入房间
                this.on_enter_room_return(body);
            }
            break;
            case Cmd.Game5Chess.Exit_room:
            {//退出房间

            }
            break;
            case Cmd.Game5Chess.Sitdown:
            {//玩家坐下
                this.on_sitdown_return(body);
            }
            break;
            case Cmd.Game5Chess.Standup:
            {//玩家站起
                this.on_standup_return(body);
            }
            break;
            case Cmd.Game5Chess.Send_prop:
            {
                this.on_send_prop(body);
            }
            break;
            case Cmd.Game5Chess.Send_do_ready:
            {
                console.log('玩家准备消息');
                this.on_player_do_ready(body);
            }
            break;
            case Cmd.Game5Chess.Round_start:
            {
                console.log('游戏开始消息');
                this.on_game_start(body);
            }
            break;
            case Cmd.Game5Chess.Turn_to_player:
            {
                this.turn_to_player(body);
            }
            break;
            case Cmd.Game5Chess.Put_chess:
            {
                this.player_put_chess(body);
            }
            break;
            case Cmd.Game5Chess.CheckOut:
            {
                this.on_checkout(body);
            }
            break;
            case Cmd.Game5Chess.CheckOut_over:
            {
                this.on_checkout_over(body);
            }
            break;
            case Cmd.Game5Chess.Reconnect:
            {
                this.do_reconnect(body);
            }
            break;
            case Cmd.Game5Chess.Get_prev_round:
            {
                this.on_get_prev_round(body);
            }
            break;
            case 1000:
            {
                console.log('body = ' + JSON.stringify(body));
            }
            case Cmd.Game5Chess.User_arrived:
            {
                this.on_user_arrived(body);
            }
            break;
        }
    },

    on_boradcast_server_return: function(stype, ctype, body){
        console.log('on_boradcast_server_return' + stype, ctype, JSON.stringify(body));
    },

    on_do_ready_click: function(){
        five_chess.send_do_ready();
    },

    on_do_prev_round_click: function(){
        five_chess.send_get_prev_round();
    },

});
