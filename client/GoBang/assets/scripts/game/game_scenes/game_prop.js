// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var prop_skin = cc.Class({
    name: 'prop_skin',
    properties: {
        icon: {
            type: cc.SpriteFrame,
            default: null,
        },

        anim_frames: {
            type: cc.SpriteFrame,
            default: [],
        },

    },
});

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
        
        skin_set: {
            type: prop_skin,
            default: [],
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.frame_anim = this.node.getChildByName('anim').getComponent('frame_anim');
        this.anim_sprite = this.node.getChildByName('anim').getComponent(cc.Sprite);
    },

    start () {

    },

    // update (dt) {},

    play_prop_anim: function(from, to_dst, propid){
        if(propid <= 0 || propid > 5){
            return;
        }
        this.anim_sprite.spriteFrame = this.skin_set[propid - 1].icon;

        this.node.setPosition(from);
        var moveTo = cc.moveTo(1.0, to_dst).easing(cc.easeCubicActionOut());
        var func = cc.callFunc(function(){
            this.frame_anim.sprite_frames = this.skin_set[propid - 1].anim_frames;
            this.frame_anim.play_once(function(){
                this.node.removeFromParent();
            }.bind(this));
        }.bind(this));
        // var delay = cc.delayTime(0.3);

        var seq = cc.sequence(moveTo, func);
        this.node.runAction(seq);
    },

});
