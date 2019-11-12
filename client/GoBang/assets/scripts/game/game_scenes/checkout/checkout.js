// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

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

        result: {
            type: cc.Label, 
            default: null,
        },

        score: {
            type: cc.Label, 
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    start () {
        this.node.active = false;
    },

    // update (dt) {},

    //0表示输, 1 表示赢,  2表示平局
    show_checkout_result: function(ret, score){
        this.node.active = true;
        if(ret == 2){
            this.result.string = '平局';
            this.score.string = '本次赢了(0)金币';
            return;
        }

        if(ret == 1){//胜利
            this.result.string = '胜利';
            this.score.string = '本次赢了(' + score + ')金币';
            return;
        }

        if(ret == 0){
            this.result.string = '失败';
            this.score.string = '本次输了(' + score + ')金币';
            return;
        }

    },

    hide_checkout_result: function(){
        this.node.active = false;
    },

    on_close_click: function(){
        // this.node.removeFromParent();
        this.node.active = false;
    },

});
