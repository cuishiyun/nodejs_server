// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var websocket = require('websocket');
var auth = require('auth');
var Stype = require('Stype');
var Cmd = require('Cmd');
var Responses = require('Responses');
var ugame = require('ugame');

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

        account_reg: {
            default: null,
            type: cc.Node,
        },

        forget_pwd: {
            default: null,
            type: cc.Node,
        },

        uname_login: {
            default: null,
            type: cc.Node,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var service_handlers = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        service_handlers[Stype.Game_system] = this.on_system_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    },

    start () {
        // this.scheduleOnce(function(){
        //     cc.director.loadScene('home_scene');
        // }.bind(this), 2.0);

        this.account_reg.active = false;
        this.forget_pwd.active = false;
        this.uname_login.active = false;

    },

    // update (dt) {},

    /**
     * 游客登陆
     */
    on_guest_login_click: function(){
        auth.guest_login();

        // if(ugame.is_guest){
        //     auth.guest_login();
        // }else{
        //     auth.uname_login();
        // }
    },

    on_uname_login_click: function(){
        // auth.uname_login();
        console.log('账号登录');
        this.uname_login.active = true;
    },

    on_register_account_click: function(){
        console.log('注册账号');
        this.account_reg.active = true;
    },

    on_forget_pwd_click: function(){
        console.log('忘记密码');
        this.forget_pwd.active = true;
    },

    /**
     * 微信登录
     */
    on_wechat_login_click: function(){

    },
   
    //登录成功之后,登录到游戏服务器上面
    on_auth_login_success: function(){
        game_system.get_game_info();
    },

    on_system_server_return(stype, ctype, body){
        console.log('system_server_return ' + stype + ' ' + ctype + ' ' + JSON.stringify(body));
        switch(ctype){
            case Cmd.GameSystem.Get_game_info:
            {
                var status = body.status;
                if(status != Responses.OK){
                    console.log('loading 获取游戏信息 failed, status = ' + status);
                    return;
                }
                
                console.log('loading 获取游戏信息 success, body = ' + JSON.stringify(body));
                //保存数据 {uchip, uexp, uvip}
                ugame.save_user_game_data(body);

                cc.director.loadScene('home_scene');
            }
            break;
            default:
            break;
        }
    },

    //登陆验证入口函数
    on_auth_server_return(stype, ctype, body){
        switch(ctype){
            case Cmd.Auth.GUEST_LOGIN:
            {
                if(body.status != Responses.OK){
                    return;
                }
                console.log('loading游客登录成功', stype, ctype, body);
                // unick, usex, uface, uvip, ukey
                ugame.guest_login_success(body.unick, body.usex, body.uface, body.uvip, body.ukey);
                
                //cc.director.loadScene('home_scene');
                this.on_auth_login_success();
            }
            break;
            case Cmd.Auth.RELOGIN:
            {
                console.log('loading 账号在其他设备已登录');
                // cc.director.loadScene('loading');//返回登录界面
            }
            break; 
            case Cmd.Auth.UNAME_LOGIN:
            {
                console.log('loading uname 收到登录消息', stype, ctype, body);
                if(body.status != Responses.OK){
                    return;
                }
                console.log('loading uname登录成功', stype, ctype, body);
                // unick, usex, uface, uvip 
                ugame.uname_login_success(body.unick, body.usex, body.uface, body.uvip);
                // cc.director.loadScene('home_scene');
                this.on_auth_login_success();
            }
            break;
            case Cmd.Auth.GET_PHONE_REG_VARIFY:
            {
                console.log('loading 获取手机验证码', stype, ctype, body);
                if(body.status != Responses.OK){
                    return;
                }
                
            }
            break;
            case Cmd.Auth.PHONE_REG_ACCOUNT:
            {
                console.log('loading 注册账号', stype, ctype, body);
                if(body.status != Responses.OK){
                    return;
                }
                
                ugame._save_uname_and_upwd();

                //调用登录命令
                console.log('loading 自动登录');
                auth.uname_login();

            }
            break;
            case Cmd.Auth.Get_forget_pwd_verify:
            {
                console.log('loading 忘记密码获取验证码', stype, ctype, body);
            }
            break;
            case Cmd.Auth.Reset_user_pwd:
            {
                console.log('loading 重置密码', stype, ctype, body);
            }
            break;
            default:
            {
                console.log('auth 客户端不能识别出ctype');
            }
            break;
        }

    },

});
