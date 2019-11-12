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

        //正常的图片
        icon_normal: {
            default: null,
            type: cc.SpriteFrame,
        },

        //按下的图片
        icon_selected: {
            default: null,
            type: cc.SpriteFrame,
        },

        icon:{
            default: null,
            type: cc.Sprite,
        },

        label:{
            default: null,
            type: cc.Node,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.icon = this.node.getChildByName('icon').getComponent(cc.Sprite);
        this.label = this.node.getChildByName('name');
        this.is_active = false;
    },

    start () {

    },

    // update (dt) {},

    set_actived(is_active){
        this.is_active = is_active;
        if(this.is_active){
            this.icon.spriteFrame = this.icon_selected;
            this.label.color = cc.color(64, 155, 226,255);
        }else{
            this.icon.spriteFrame = this.icon_normal;
            this.label.color = cc.color(118,118,118,255);
        }
    },

});
