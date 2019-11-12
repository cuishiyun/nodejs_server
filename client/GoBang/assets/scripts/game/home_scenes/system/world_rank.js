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

        not_inrank: {
            type: cc.Node,
            default: null,
        },

        self_rank_label: {
            type: cc.Label,
            default: null,
        },

        rank_item_prefan: {
            type: cc.Prefab,
            default: null,
        },

        content: {
            type: cc.Node,
            default: null,
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    start () {
        game_system.get_world_rank_info();
    },

    // update (dt) {},

    //rank_data [[unick, usex, uface, uchip],[],[]]
    show_world_rank: function(my_rank, rank_data){
        console.log('@@@' + my_rank + '###' + JSON.stringify(rank_data));
        for(var i = 0; i < rank_data.length; i++){
            var data = rank_data[i];
            var item = cc.instantiate(this.rank_item_prefan);
            this.content.addChild(item);

            var rank_item = item.getComponent('rank_item');
            rank_item.show_rank_info(i + 1, data[0], data[1], data[2], data[3]);

            //显示自己的排行
            if(my_rank <= 0){
                this.not_inrank.active = true;
                this.self_rank_label.node.active = false;
            }else{
                this.not_inrank.active = false;
                this.self_rank_label.node.active = true;
                this.self_rank_label.string = '' + my_rank;
            }

        }
    },



});
