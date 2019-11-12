// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var auth = require('auth');
var md5 = require('md5');
var ugame = require('ugame');

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

        phone_editbox: {
            type: cc.EditBox,
            default: null,
        },

        pwd_editbox: {
            type: cc.EditBox,
            default: null,
        },

        pwd_again_editbox: {
            type: cc.EditBox,
            default: null,
        },

        verify_code_editbox: {
            type: cc.EditBox,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = true;
    },

    start () {

    },

    // update (dt) {},

    on_close_click: function(){
        this.node.active = false;
    },

    on_get_identify_click: function(){
        if(this.phone_editbox.string.length != 11){
            return;
        }

        var phone_num = this.phone_editbox.string;
        auth.get_forget_pwd_verify_code(phone_num);
    },

    on_commit_click: function(){
        var phone = this.phone_editbox.string;
        var pwd = this.pwd_editbox.string;
        var verify_code = this.verify_code_editbox.string;

        ugame.save_temp_uname_and_upwd(phone, pwd);

        pwd = md5(pwd);
        auth.reset_user_pwd(phone, pwd, verify_code);
    },

});
