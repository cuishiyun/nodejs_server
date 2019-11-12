// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

/**
 * date: 2019-03-01
 * auth协议
 */

var websocket = require('websocket');
var Cmd = require('Cmd');
var ugame = require('ugame');
var md5 = require('md5');
import auth_proto from './auth_proto';
import Stype from '../Stype';

const {ccclass, property} = cc._decorator;

@ccclass
export default class auth {

    /**
     * 游客登录
     */
    public static guest_login(){
        var key = ugame.guest_key;//
        var body = key;
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, body);
    }
   
    /**
     * 用户名和密码登录
     */
    public static uname_login(uname: string, upwd: string){
        // upwd = md5(upwd);
        var body = {
            0: uname,
            1: upwd,  
        };
        websocket.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, body);
    }

}
