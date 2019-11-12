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

import Responses from '../Responses';
import Stype from '../Stype';

var proto_man = require('proto_man');
var proto_tools = require('proto_tools');
var Cmd = require('Cmd');

const { ccclass, property } = cc._decorator;

@ccclass
export default class auth_proto {

    /** 
     * 游客登录协议  Cmd.Auth.GUEST_LOGIN
     * 客户端发送: stype, ctype, 游客唯一标识
     * 服务器返回:  stype, ctype, body: {
     *      "status":1,
     *      "uid":0,
     *      "unick":"12345678",
     *      "usex":1,
     *      "uface":0,
     *      "uvip":0,
     *      "ukey":"xeCBfzenkZSjAzmQrDDsP8YFzZy4Rjs2",
     *      "is_guest":1}
     * 
     */

    /**
     * 用户名和密码登录  Cmd.Auth.UNAME_LOGIN
     * 客户端发送 stype, ctype, body: {
     *     0: 用户名,
     *     1: 密码,
     * }
     * 
     * 服务器返回:  stype, ctype, body: {
     *      "status":1,
     *      "uid":0,
     *      "unick":"12345678",
     *      "usex":1,
     *      "uface":0,
     *      "uvip":0,
     *      "ukey":"xeCBfzenkZSjAzmQrDDsP8YFzZy4Rjs2",
     *      "is_guest":1}
     * 
     * 
     */

}
