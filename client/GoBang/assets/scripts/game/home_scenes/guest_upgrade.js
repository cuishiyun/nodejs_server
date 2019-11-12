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
var websocket = require('websocket');
var Cmd = require('Cmd');
var Responses = require('Responses');
var Stype = require('Stype');
var md5 = require('md5');
var auth = require('auth');

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
        
        //手机号
        input_phone_number: {
            default: null,
            type: cc.EditBox,
        },

        //密码
        input_new_pwd: {
            default: null,
            type: cc.EditBox,
        },

        //确认密码
        input_again_pwd: {
            default: null,
            type: cc.EditBox,
        },

        //验证码输入框
        input_identify_pwd: {
            default: null,
            type: cc.EditBox,
        },

        //错误码
        error_desic_label: {
            type: cc.Label, 
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.error_desic_label.node.active = false;
    },

    start () {

    },

    // update (dt) {},

    on_get_identify_click: function(){
        var phone_num = this.input_phone_number.string;
        if(!phone_num || phone_num.length != 11){
            // console.log('手机号有误');
            this.show_error_tip('无效的电话号码');
            return;
        }

        //发送命令给服务器,获取验证码
        console.log(phone_num + '获取验证码');
        auth.get_guess_upgrade_verify_code(phone_num, ugame.guest_key);
    },

    on_guest_upgrade_click: function(){
        this.error_desic_label.node.active = false;
        this.unscheduleAllCallbacks();

        console.log('提交绑定信息');
        var phone_num = this.input_phone_number.string;
        var pwd = this.input_new_pwd.string;
        var againPwd = this.input_again_pwd.string;
        var ukey = ugame.guest_key;
        var identify = this.input_identify_pwd.string;
        if(pwd != againPwd){
            this.show_error_tip('两次输入的密码不一致');
            // console.log('两次密码不一致');
            return;
        }
        
        if(!phone_num || phone_num.length != 11){
            this.show_error_tip('无效的电话号码');
            // console.log('手机号有误');
            return;
        }

        if(!identify || identify.length != 4){
            this.show_error_tip('验证码错误!');
            return;
        }

        ugame.save_temp_uname_and_upwd(phone_num, pwd);

        //发送命令到服务器
        pwd = md5(pwd);
        auth.guest_bind_phone(phone_num, pwd, identify);

    },

    /**
     * 展示错误信息
     * @param {*} desic 
     */
    show_error_tip: function(desic){
        this.error_desic_label.node.active = true;
        this.error_desic_label.string = desic;
        
        this.scheduleOnce(function(){
            this.error_desic_label.node.active = false;
        }.bind(this), 3);
    },

});
