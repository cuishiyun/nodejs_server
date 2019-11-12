// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var ulevel = require('ulevel');
var five_chess = require('five_chess');

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

        uncik: {
            type: cc.Label,
            default: null,
        },

        uchip: {
            type: cc.Label,
            default: null,
        },

        uvip: {
            type: cc.Label,
            default: null,
        },

        ulevel: {
            type: cc.Label,
            default: null,
        },

        uexp_process: {
            type: cc.ProgressBar,
            default: null,
        },

        usex: {
            type: cc.Sprite,
            default: null,
        },

        usex_sp: {
            type: cc.SpriteFrame,
            default: [],
        },

        egg: {
            type: cc.Node,
            default: null,
        },

        hua: {
            type: cc.Node,
            default: null,
        },

        pijiu: {
            type: cc.Node,
            default: null,
        },

        zhadan: {
            type: cc.Node,
            default: null,
        },

        zui: {
            type: cc.Node,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {

    },

    // update (dt) {},

    /**
     * var player_info = {
            unick: ugame.unick,
            usex: ugame.usex,
            uface: ugame.uface,

            uvip: ugame.user_game_info.uvip,
            uchip: ugame.user_game_info.uchip,
            uexp: ugame.user_game_info.uexp,

            sv_seatid: sv_seatid,
        };
     * @param {*} player_info 
     */
    on_show_user_info: function(player_info){
        console.log('on_show_user_info ' + JSON.stringify(player_info));
        this.uncik.string = '' + player_info.unick;
        this.uchip.string = '' + player_info.uchip;
        this.usex.spriteFrame = this.usex_sp[player_info.usex];
        this.uvip.string = 'VIP' + player_info.uvip;
        var ret = ulevel.get_level(player_info.uexp);
        this.ulevel.string = 'LV' + ret[0];
        this.uexp_process.progress = ret[1];

        if(player_info.is_self){
            //如果是自己,隐藏道具  
            this.egg.active = false;
            this.hua.active = false;
            this.pijiu.active = false;
            this.zhadan.active = false;
            this.zui.active = false;
        }

        this.sv_seatid = player_info.sv_seatid;
    },

    on_close_click: function(){
        this.node.removeFromParent();
    },
   
    on_prop_egg: function(){
        this.on_prop_item(1);
    },

    on_prop_hua: function(){
        this.on_prop_item(2);
    },
    
    on_prop_pijiu: function(){
        this.on_prop_item(3);
    },

    on_prop_zui: function(){
        this.on_prop_item(4);
    },

    on_prop_zhadan: function(){
        this.on_prop_item(5);
    },

    on_prop_item: function(prop_id){
        if(this.is_self){
            return;
        }
        console.log('on_prop_item ' + prop_id);
        var to_seatid = this.sv_seatid;
        five_chess.send_prop(to_seatid, prop_id);

        this.node.removeFromParent();
    },

});
