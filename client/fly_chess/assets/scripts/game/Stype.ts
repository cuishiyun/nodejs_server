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
 * 注册的所有的服务号
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class Stype{

    public static Broadcast: number = 10000;//广播服务
    public static TalkRoom: number = 1;//聊天服务

    public static Auth: number = 2;//登录服务
    public static GameSystem: number = 3;//系统服务  个人和系统,不会存在多个玩家进行交互
    
    public static Game5Chess: number = 4;//五子棋的休闲模式游戏服务
    
    public static GameFlyChess: number = 5;//飞行棋服务
    
}
