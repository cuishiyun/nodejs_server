// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var ugame = require('ugame');
var ulevel = require('ulevel');

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

        uchip: {
            type: cc.Label,
            default: null,
        },

        ulevel: {
            type: cc.Label,
            default: null,
        },

        uexp_progress:{
            type: cc.ProgressBar,
            default: null,
        },

        usex: {
            type: cc.Sprite,
            default: null,
        },

        usex_sp:{
            type: cc.SpriteFrame,
            default: [],
        },

        uvip: {
            type: cc.Label,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       
    },

    start () {
        this.sync_info();
    },

    // update (dt) {},

    sync_info: function(){
        this.unick.string = ugame.unick;

        var game_info = ugame.user_game_info;
        this.uchip.string = '' + game_info.uchip;
        this.usex.spriteFrame = this.usex_sp[ugame.usex];
        this.uvip.string = 'VIP' + game_info.uvip;

        var ret = ulevel.get_level(game_info.uexp);
        console.log('sync_info, uexp = ' + game_info.uexp + 'ret = ' + JSON.stringify(ret));

        this.ulevel.string = 'LV' + ret[0];
        this.uexp_progress.progress = ret[1];
    },

    on_xinshou_btn_click: function(){
        ugame.enter_zone(1);
        cc.director.loadScene('game_scenes');
    },

    on_gaoshou_btn_click: function(){
        ugame.enter_zone(2);
        cc.director.loadScene('game_scenes');
    },

    on_dashi_btn_click: function(){
        ugame.enter_zone(3);
        cc.director.loadScene('game_scenes');
    },

    on_friend_btn: function(){

    },

    on_renji_btn_click: function(){

    },

});
