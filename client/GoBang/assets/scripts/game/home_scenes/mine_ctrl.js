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

        //返回按钮
        back:{
            type: cc.Node,
            default: null,
        },

        edit_userinfo_node:{
            type: cc.Node,
            default: null,
        },

        guest_bind_btn: {
            type: cc.Node,
            default: null,
        },

        guest_upgrade_prefab: {
            type: cc.Prefab,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
      
    },

    start () {
        this.back.active = false;

        if(ugame.is_guest){
            this.guest_bind_btn.active = true;//显示
        }else{
            this.guest_bind_btn.active = false;//隐藏
        }

    },

    // update (dt) {},

    sync_info: function(){
        this.unick.string = ugame.unick;
    },

    //点击个人信息按钮---修改资料
    onClickSelfInfoBtn(){
        // console.log('onClickSelfInfoBtn');
        cc.loader.loadRes('prefabs/home_scene/edit_userinfo', cc.Prefab, function(err, res){
            if(err){
                console.log('err = ', err);
                return;
            }
            
            this.edit_userinfo_node = cc.instantiate(res);
            this.node.addChild(this.edit_userinfo_node);
            this.back.active = true;
        }.bind(this));
    },

    /**
     * 点击返回按钮
     */
    on_back_btn(){
        if(this.edit_userinfo_node != null){
            this.edit_userinfo_node.removeFromParent(true);
        }
        this.back.active = false;
    },

    on_edit_profile_success: function(){
        this.unick.string = ugame.unick;
    },

    // /**
    //  * 绑定手机
    //  */
    // on_bindPhone_btn(){
    //     console.log('on_bindPhone_btn');
    // },

    //游客绑定手机
    on_bindPhone_btn: function(){
        console.log('on_bindPhone_btn');
        this.back.active = true;
        this.second_ui = cc.instantiate(this.guest_upgrade_prefab);
        this.node.addChild(this.second_ui);
    },

});
