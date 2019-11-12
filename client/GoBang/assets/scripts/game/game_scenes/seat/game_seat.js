// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var State = require('State');
var action_time = require('action_time');

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        unick: {
            type: cc.Label,
            default: null,
        },

        timebar: {
            type: action_time,
            default: null,
        },

        user_info_prefab: {
            type: cc.Prefab,
            default: null,
        },

        ready_icon: {
            type: cc.Node,
            default: null,
        },

        black_chess: {
            type: cc.Node,
            default: null,
        },

        white_chess: {
            type: cc.Node,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = false;
        this.timebar.node.active = false;
        this.is_self = false;

        this.ready_icon.active = false;
        this.state = State.InView;

        this.black_chess.active = false;
        this.white_chess.active = false;
    },

    start () {

    },

    // update (dt) {},

    //玩家坐下
    on_sitdown: function(player_info){
        console.log(State.Ready + '##### ' + JSON.stringify(player_info));

        this.state = State.InView;

        this.node.active = true;
        this.player_info = player_info;
        this.unick.string = player_info.unick;
        this.is_self = player_info.is_self;
        this.ready_icon.active = false;

        if(player_info.state == State.Ready){
            this.on_do_ready();
        }

        this.black_chess.active = false;
        this.white_chess.active = false;
    },

    //玩家站起
    on_standup: function(){
        this.state = State.InView;

        this.node.active = false;
        this.player_info = null;
        this.ready_icon.active = false;

        this.black_chess.active = false;
        this.white_chess.active = false;
    },

    on_do_ready: function(){
        this.ready_icon.active = true;
    },

    //获取座位id
    get_sv_seatid: function(){
        return this.player_info.sv_seatid;
    },

    on_seat_click: function(){
        this.user_info = cc.instantiate(this.user_info_prefab);
        this.node.parent.addChild(this.user_info);
        this.user_info.getComponent('game_show_info').on_show_user_info(this.player_info);
    },

    on_game_start: function(body){
        this.state = State.Playing;

        this.ready_icon.active = false;
        this.action_time = body[0];
        this.black_seat = body[2];
        
        this.timebar.node.active = false;
        //console.log('显示黑白方 ' + this.black_seat + this.get_sv_seatid());

        if(this.black_seat == this.get_sv_seatid()){
            //自己持黑
            this.black_chess.active = true;
            this.white_chess.active = false;
        }else{
            this.black_chess.active = false;
            this.white_chess.active = true;
        }

    },

    //轮到玩家
    turn_to_player: function(action_time){
        //进度条
        this.timebar.node.active = true;
        this.timebar.start_action_time(action_time);
    },

    hide_timebar: function(){
        this.timebar.node.active = false;
    },

    on_checkout_over: function(){
        this.timebar.node.active = false;
        this.black_chess.active = false;
        this.white_chess.active = false;
    },

});
