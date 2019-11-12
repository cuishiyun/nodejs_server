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
var auth = require('auth');
var md5 = require('md5');

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

        uname_edixbox: {
            type: cc.EditBox,
            default: null,
        },

        upwd_editbox: {
            type: cc.EditBox,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = true;
    },

    start () {
        if(ugame.uname != null){
            this.uname_edixbox.string = ugame.uname;
            this.upwd_editbox.string = ugame.upwd;
        }
    },

    // update (dt) {},

    on_close_click: function(){
        this.node.active = false;
    },

    on_commit_click: function(){
        ugame.save_temp_uname_and_upwd(this.uname_edixbox.string, this.upwd_editbox.string);
        auth.uname_login();
    },

});
