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
var Stype = require('Stype');
var Cmd = require('Cmd');
var ugame = require('ugame');
var Responses = require('Responses');

var mine_ctrl = require('mine_ctrl');
var system_ctrl = require('system_ctrl');
var home_ctrl = require('home_ctrl');
var friend_ctrl = require('friend_ctrl');

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

        tab_buttons:{
            default: [],
            type: cc.Button,
        },

        tab_content: {
            default: [],
            type: cc.Node,
        },

        login_bonues_prefab: {
            default: null,
            type: cc.Prefab,
        },

        _login_bonues: {
            default: null,
            type: cc.Node,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.tab_button_com_set = [];
        for(var i=0; i<this.tab_buttons.length;i++){
            var com = this.tab_buttons[i].getComponent('tab_button');
            this.tab_button_com_set.push(com);
        }

        var service_handlers = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        service_handlers[Stype.Game_system] = this.on_system_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    },

    start () {
        this.onClickTabBtn(null, '0');//初始选中的按钮
        this.mine = this.tab_content[3];//['3']
        this.mine = this.mine.getComponent(mine_ctrl);
        
        this.friend = this.tab_content[2];
        this.friend = this.friend.getComponent(friend_ctrl);

        this.system = this.tab_content[1];
        this.system = this.system.getComponent(system_ctrl);

        this.home = this.tab_content[0];
        this.home = this.home.getComponent(home_ctrl);

        //获取今天的登录奖励
        this.get_login_bonues_today();
    },

    // update (dt) {},

    get_login_bonues_today: function(){
        game_system.get_login_bonues_today();
    },

    disable_tab: function(index){
        this.tab_button_com_set[index].set_actived(false);
        this.tab_buttons[index].interactable = true;//禁用按钮
        this.tab_content[index].active = false;
    },

    enable_tab: function(index){
        this.tab_button_com_set[index].set_actived(true);
        this.tab_buttons[index].interactable = false;
        this.tab_content[index].active = true;

        var listView = this.tab_content[index].getChildByName('list').getComponent(cc.ScrollView);
        listView.content.getChildByName('uinfo').getChildByName('unick').getComponent(cc.Label).string = ugame.unick;
    },

    onClickTabBtn(e, index){
        index = parseInt(index);
        for(var i=0; i< this.tab_buttons.length; i++){
            if(i == index){
                this.enable_tab(i);
            }else{
                this.disable_tab(i);
            }
        }
    },

    on_guest_bind_phone_return: function(body){
        var status = body;
        if(status != Responses.OK){
            console.log('guest bind phone error, stauts = ' + status);
            return;
        }
        ugame.guest_bind_phone_success();
        console.log('guest bind phone success');
    },

    on_recv_login_bonues_server_return: function(body){
        console.log('on_recv_login_bonues_server_return, body = ' + JSON.stringify(body));
        if(body['0'] != Responses.OK){
            return;
        }

        console.log('成功领取金币' + body['1']);
        ugame.user_game_info.uchip += body['1'];
        this.home.sync_info();
    },

    on_get_world_rank_info_server_return: function(body){
        console.log('on_get_world_rank_info_server_return, body = ' + JSON.stringify(body));
        this.system.on_get_world_rank_data(body[3], body[2]);
    },

    on_system_server_return(stype, ctype, body){
        switch(ctype){
            case Cmd.GameSystem.Get_login_bonues:
            {
                console.log('system server,ctype = ' + ctype + ',body = ' + JSON.stringify(body));
                var status = body['0'];
                if(status != Responses.OK){
                    return;
                }

                var has_bonues = body['1'] ;
                if(has_bonues != 1){
                    return;
                }

                var bonues_id = body['2'];
                var bonues = body['3'];
                var days = body['4'];

                //弹出登录奖励的界面
                this._login_bonues = cc.instantiate(this.login_bonues_prefab);
                this.node.addChild(this._login_bonues);
                this.scheduleOnce(function(){
                    this._login_bonues.getComponent('login_bonues').show_login_bonues(bonues_id, bonues, days);
                }.bind(this), 0.1);

            }
            break;
            case Cmd.GameSystem.Recv_login_bonues:
            {
                this.on_recv_login_bonues_server_return(body);
            }
            break;
            case Cmd.GameSystem.Get_world_rank_info:
            {
                this.on_get_world_rank_info_server_return(body);
            }
            break;
            default:
            break;
        }
    },

    //登陆验证入口函数
    on_auth_server_return(stype, ctype, body){
        switch(ctype){
            case Cmd.Auth.RELOGIN:
            {
                console.log('homescene 账号在其他设备已登录');
                cc.director.loadScene('loading');//返回登录界面
            }
            break; 
            case Cmd.Auth.EDIT_PROFILE:
            {
                console.log('修改用户资料. body = ' + JSON.stringify(body));
                if(body.status == Responses.OK){//发送通知,资料修改成功,修改ui和数据
                    ugame.edit_profile_success(body.unick, body.usex);

                    this.mine.on_edit_profile_success();
                    this.mine.on_back_btn();

                    this.mine.sync_info();
                    this.system.sync_info();
                    this.friend.sync_info();
                    this.home.sync_info();
                }
            }
            break;
            case Cmd.Auth.GUEST_UPGRADE_IDENTIFY:
            {
                console.log('获取验证码. server return body = ' + body);
                if(body.status == Responses.OK)
                {
                    console.log('验证码发送成功');
                }
            }
            break;
            case Cmd.Auth.BIND_PHONE_NUM:
            {
                console.log('绑定游客账号server return body = ' + JSON.stringify(body));
                this.on_guest_bind_phone_return(body);
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
