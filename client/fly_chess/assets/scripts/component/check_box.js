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

        normal: {
            type: cc.SpriteFrame,
            default: null,
        },

        select: {
            default: null,
            type: cc.SpriteFrame,
        },

        b_checked: false,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sp = this.node.getComponent(cc.Sprite);
        this.set_checked(this.b_checked);
    },

    start () {

    },

    // update (dt) {},

    set_checked: function(b_checked){
        this.b_checked = b_checked;
        if(this.b_checked){
            this.sp.spriteFrame = this.select;
        }else{
            this.sp.spriteFrame = this.normal;
        }
    },

    is_checked: function(){
        return this.b_checked;
    },

});
