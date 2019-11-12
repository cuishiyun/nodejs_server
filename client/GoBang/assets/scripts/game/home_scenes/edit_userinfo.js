// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var check_box = require('check_box');
var ugame = require('ugame');
var auth = require('auth');

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

        unick_inpit: {
            type: cc.EditBox,
            default: null,
        },

        man_checkbox:{
            type: check_box,
            default: null,
        },

        woman_checkbox: {
            type: check_box,
            default: null,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
     
    },

    start () {
        this.set_check_sex(ugame.usex);
        this.unick_inpit.string = ugame.unick;
    },

    // update (dt) {},

    set_check_sex: function(type){
        this.usex = type;
        if(type == 0){
            //man
            this.man_checkbox.set_checked(true);
            this.woman_checkbox.set_checked(false);
        }else{
            this.man_checkbox.set_checked(false);
            this.woman_checkbox.set_checked(true);
        }
    },

    on_check_click: function(e, type){
        type = parseInt(type);
        this.set_check_sex(type);
    },

    on_click_comit_btn: function(){
        var newNick = this.unick_inpit.string;//.getComponent(cc.EditBox)
        var newSex;
        if(this.man_checkbox.is_checked() == true){
            newSex = 0;//'男';
        }

        if(this.woman_checkbox.is_checked() == true){
            newSex = 1;//'女';
        }
        console.log('on_click_comit_btn,name = ' + newNick + ',sex = ' + newSex); 
        
        auth.edit_profile({
            unick: newNick,
            usex: newSex,
        });
    },

});
