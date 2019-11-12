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
var http = require('http');
var proto_man = require('proto_man');

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

        _is_proto_json: true,
        _is_release: false,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        /**
        * var data = {
               host: game_config.gateway_config.host,
               tcp_port: game_config.gateway_config.ports[0],
               ws_port: game_config.gateway_config.ports[1],
           };
        */
        this.server_info = null;
        if(this._is_release){
            this.host_ip = 'http://www.elviscui.xyz:10001';
        }else{
            this.host_ip = 'http://127.0.0.1:10001';
        }
    },

    //获取socket的ip和地址
    get_server_info: function () {//
        http.get(this.host_ip, '/server_info', null, function (err, ret) {
            if (ret != null) {
                if (this.server_info != null) {
                    this.unschedule(this.get_server_info);
                    return;
                }

                this.unschedule(this.get_server_info);

                var data = JSON.parse(ret);
                this.server_info = data;
                this.connect_to_server();
            } else {
                this.scheduleOnce(this.get_server_info, 10.0);
                return;
            }
        }.bind(this));
    },

    connect_to_server: function () {
        if (this._is_proto_json) {
            websocket.connect('ws://' + this.server_info.host + ':' + this.server_info.ws_port + '/ws', proto_man.PROTO_JSON);//websocket + json协议
            console.log('websocket 连接到 ' + this.server_info.host + ':' + this.server_info.ws_port);
        } else {
            //websocket.connect('ws://' + this.server_info.host + ':' + this.server_info.ws_port + '/ws', proto_man.PROTO_BUF);//websocket + buf二进制协议
        }
    },


    start() {
        this.get_server_info();
    },

    // update (dt) {},



});
