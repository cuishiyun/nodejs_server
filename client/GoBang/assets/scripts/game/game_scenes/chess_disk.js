// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var BLOCK_WIDTH = 41;
var five_chess = require('five_chess');

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

        chess_prefab: {
            type: cc.Prefab,
            default: [],
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.your_turn = false;

        this.node.on(cc.Node.EventType.TOUCH_START, function(e){
            if(!this.your_turn){
                return;
            }

            var w_pos = e.getLocation();
            var pos = this.node.convertToNodeSpaceAR(w_pos);//棋盘下的坐标,以棋盘中心为原点
            pos.x += BLOCK_WIDTH * 7;
            pos.y += BLOCK_WIDTH * 7;

            var block_x = Math.floor((pos.x + BLOCK_WIDTH * 0.5)/BLOCK_WIDTH);
            var block_y = Math.floor((pos.y + BLOCK_WIDTH * 0.5)/BLOCK_WIDTH);

            if(block_x < 0 || block_x > 14 || block_y < 0 || block_y > 14){
                return;
            }

            //在这个位置产生棋子
            // this.put_chess_at(1, block_x, block_y);//test 坐标换算
            five_chess.send_put_chess(block_x, block_y);
        }.bind(this), this);
    },

    start () {

    },

    // update (dt) {},

    //black : 1, white : 2
    put_chess_at: function(chess_type, block_x, block_y){
        var chess = cc.instantiate(this.chess_prefab[chess_type - 1]);
        this.node.addChild(chess);

        var xpos = block_x * BLOCK_WIDTH - BLOCK_WIDTH * 7;
        var ypos = block_y * BLOCK_WIDTH - BLOCK_WIDTH * 7;
        chess.setPosition(cc.v2(xpos, ypos));
    },

    set_your_turn: function(your_turn){
        this.your_turn = your_turn;
    },

    clear_disk: function(){
        this.node.removeAllChildren();
    },

});
