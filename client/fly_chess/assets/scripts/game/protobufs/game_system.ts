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
 * 系统服协议
 * date: 2019-03-01
 */

var websocket = require('websocket');
var Cmd = require('Cmd');
var ugame = require('ugame');
var md5 = require('md5');
import game_system from './game_system_proto';
import Stype from '../Stype';

const {ccclass, property} = cc._decorator;

@ccclass
export default class game_system  {

    //登录到游戏服务器
    public static get_game_info(){
        var body = null;
        websocket.send_cmd(Stype.GameSystem, Cmd.GameSystem.Get_game_info, body);
    }
  
}
