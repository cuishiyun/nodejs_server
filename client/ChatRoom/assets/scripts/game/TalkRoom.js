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
var utils = require('utils');

var STYPE_TALKROOM = 1;//cmd

var TalkCmd = {
	Enter: 1,//用户进来
	Exit: 2,//用户离开
	UserArrived: 3,//别人进来
	UserExit: 4,//别人离开

	SendMsg: 5,//自己发送消息
	UserMsg: 6,//收到别人的消息

};

//回复给客户端的
var Responses = {
	OK: 1,//进入成功
	IS_IN_ROOM: -100,//已经在聊天室里
	IS_NOTIN_ROOM: -101,//玩家不在聊天室里
	INVALD_OPT: -102,//玩家非法操作
	INVALD_PARAMS: -103,//玩家命令格式不对
};

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

        editBox: {
            type: cc.EditBox,
            default: null
        },

        scrollView: {
            type: cc.ScrollView,
            default: null
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.uname = '游客' + utils.random_int_str(4);
        this.usex = utils.random_int(1, 2);//'sex' + 

        websocket.register_serivces_handler({
            1: this.on_talk_room_service_return.bind(this),//1不能换为常量
        });

    },

    start () {
        // this.scheduleOnce(function(){
        //     this.test_cmd();
        // }.bind(this), 3.0);
    },

    // update (dt) {},

    onConnectBtn(){
       websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, {
            uname: this.uname,
            usex: this.usex,
       });
    },

    onExitBtn(){
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, null);
    },

    onSendBtn(){
        var str = this.editBox.string;
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, str);
    },

    /**
     * 测试服务端的聊天室
     */
    test_cmd: function(){
        var data = {
            uname: 'elviscui' + Math.floor(1 + Math.random() * 10),
            usex: 'sex',
        };
        console.log('myname = ' + data.uname);
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, data);//进入聊天室

        this.schedule(function(){
            websocket.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, '你好，world,我是 ' + data.uname);//发送聊天消息
        }.bind(this), 5.0);

        // this.scheduleOnce(function(){
        //     websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, null);//离开聊天室
        // }.bind(this), 15.0);
    },

    /**
     * 
     * @param {*} stype 协议号
     * @param {*} ctype 命令号
     * @param {*} body 为对象
     */
    on_talk_room_service_return: function(stype, ctype, body) {
        console.log('stype = ' + stype + ',ctype = ' + ctype + ',body = ' + JSON.stringify(body));
        
        if(stype == STYPE_TALKROOM){//聊天协议
            if(ctype == TalkCmd.Enter){//自己进入

                if(body['0'] == Responses.OK){
                    // console.log('成功进入聊天室.');
                    cc.loader.loadRes('prefabs/talk_room/desic_opt', cc.Prefab, function(err, res){
                        if(err){
                            console.log('load prefab error, err = ' + err);
                        }
                        var node = cc.instantiate(res);
                        this.scrollView.content.addChild(node);
                        node.getComponent('desic_opt').init(this.uname, this.usex, this.uname + '进入聊天室!');
                    }.bind(this));

                }

            }else if(ctype == TalkCmd.Exit){//自己退出

                if(body['0'] == Responses.OK){
                    // console.log('成功退出聊天室.'); 
                    cc.loader.loadRes('prefabs/talk_room/desic_opt', cc.Prefab, function(err, res){
                        if(err){
                            console.log('load prefab error, err = ' + err);
                        }
                        var node = cc.instantiate(res);
                        this.scrollView.content.addChild(node);
                        node.getComponent('desic_opt').init(this.uname, this.usex, this.uname + '离开聊天室!');
                    }.bind(this));
                }

            }else if(ctype == TalkCmd.UserArrived){//其他玩家进入
                // console.log('UserArrived, body = ' + JSON.stringify(body));
                cc.loader.loadRes('prefabs/talk_room/desic_opt', cc.Prefab, function(err, res){
                    if(err){
                        console.log('load prefab error, err = ' + err);
                    }
                    var node = cc.instantiate(res);
                    this.scrollView.content.addChild(node);
                    node.getComponent('desic_opt').init(body.uname, body.usex, body.uname + '进入聊天室!');
                }.bind(this));
            }else if(ctype == TalkCmd.UserExit){//其他玩家退出
                // console.log('UserExit, body = ' + JSON.stringify(body));
                cc.loader.loadRes('prefabs/talk_room/desic_opt', cc.Prefab, function(err, res){
                    if(err){
                        console.log('load prefab error, err = ' + err);
                    }
                    var node = cc.instantiate(res);
                    this.scrollView.content.addChild(node);
                    node.getComponent('desic_opt').init(body.uname, body.usex, body.uname + '离开聊天室!');
                }.bind(this));
            }else if(ctype == TalkCmd.SendMsg){//自己发送消息

                if(body['0'] == Responses.OK){
                    // console.log('发送的聊天消息为: msg = ' + JSON.stringify(body['3']));

                    cc.loader.loadRes('prefabs/talk_room/self_talk', cc.Prefab, function(err, res){
                        if(err){
                            console.log('load prefab error, err = ' + err);
                        }
                        var node = cc.instantiate(res);
                        this.scrollView.content.addChild(node);
                        node.getComponent('self_talk').init(body['1'], body['2'], body['3']);
                    }.bind(this));
                }

            }else if(ctype == TalkCmd.UserMsg){//其他玩家的消息

                // console.log('UserMsg, body = ' + JSON.stringify(body));
                cc.loader.loadRes('prefabs/talk_room/other_talk', cc.Prefab, function(err, res){
                    if(err){
                        console.log('load prefab error, err = ' + err);
                    }
                    var node = cc.instantiate(res);
                    this.scrollView.content.addChild(node);
                    node.getComponent('other_talk').init(body['0'], body['1'], body['2']);
                }.bind(this));

            }else{
                console.error('未知的ctype类型, stype = ' + stype + ',ctype = ' + ctype);
            }

        }else{
            console.error('未知的stype类型, stype = ' + stype + ',ctype = ' + ctype);
        }

        this.scrollView.scrollToBottom(0);
    },

});
