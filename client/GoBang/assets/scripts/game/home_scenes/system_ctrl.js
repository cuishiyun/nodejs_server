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

        unick: {
            type: cc.Label,
            default: null,
        },

        back: {
            type: cc.Node,
            default: null,
        },

        world_rank_prefab: {
            type: cc.Prefab,
            default: null,
        },

        main_list: {
            type: cc.Node,
            default: null,
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.world_rank_node = null;
    },

    start () {
        this.back.active = false;
    },

    // update (dt) {},

    sync_info: function(){
        this.unick.string = ugame.unick;
    },

    //获取世界排行榜
    on_leaderboard_click: function(){
        if(this.world_rank_node != null){
            this.world_rank_node.removeFromParent(true);
            this.world_rank_node = null; 
        }

        this.world_rank_node = cc.instantiate(this.world_rank_prefab);
        this.node.addChild(this.world_rank_node);

        this.back.active = true;
        this.main_list.active = false;
    },

    /**
     * 点击返回按钮
     */
    on_back_btn(){
        if(this.world_rank_node != null){
            this.world_rank_node.removeFromParent(true);
            this.world_rank_node = null;
        }
        this.back.active = false;
        this.main_list.active = true;

    },

    //获取排行榜的数据之后
    on_get_world_rank_data: function(my_rank, rank_data){
        if(this.world_rank_node != null){
            var world_rank = this.world_rank_node.getComponent('world_rank');
            world_rank.show_world_rank(my_rank, rank_data);
        }
    },

});
