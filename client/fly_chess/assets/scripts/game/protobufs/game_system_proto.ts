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
 * 游戏系统服协议
 * date: 2019-03-01
 */

import Responses from '../Responses';
import Stype from '../Stype';

var proto_man = require('proto_man');
var proto_tools = require('proto_tools');
var Cmd = require('Cmd');

const { ccclass, property } = cc._decorator;

@ccclass
export default class game_system_proto {

    /**
     * 获取游戏信息协议:  Cmd.GameSystem.Get_game_info
     * 客户端发送: stype, ctype, null
     * 服务器返回: stype, ctype, body: {
     *      "status":1,
     *      "uchip":3182,
     *      "uvip":0,
     *      "uexp":1500
     * }
     * 
     */
    
}
