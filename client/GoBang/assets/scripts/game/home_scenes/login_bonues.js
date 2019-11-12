// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var game_system = require('game_system');

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

        chip_label: {
            type: cc.Label,
             default: [],
        },

        zw_icon: {
            default: [],
            type: cc.Sprite,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bonues_info = [100, 200, 300, 400, 500];
    },

    start () {
        for(var i = 0; i < this.bonues_info.length; i++){
            this.chip_label[i].string = '' + this.bonues_info[i];
            this.zw_icon[i].node.active = false;
        }
    },

    // update (dt) {},

    show_login_bonues: function(id, bonues, days){
        if(days > this.bonues_info.length){
            days = this.bonues_info.length;
        }

        this.bonues_id = id;
        this.zw_icon[days - 1].node.active = true;
        this.chip_label[days - 1].string = '' + bonues;
    },

    on_close_btn_click: function(){
        this.node.removeFromParent();
    },

    on_recv_btn_click: function(){
        console.log('on_recv_btn_click, bonues_id = ' + this.bonues_id);
        game_system.send_recv_login_bonues(this.bonues_id);
    },

});
