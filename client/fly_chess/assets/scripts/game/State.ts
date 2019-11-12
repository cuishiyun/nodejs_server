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
 * 游戏状态
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class State {
    public static Idle: number = 1;
    public static InView: number = 2;//玩家旁观  只有玩家有这个属性
    public static Ready: number = 3;//准备好了,可以开始
    public static Playing: number = 4;//正在游戏
    public static CheckOut: number = 5, //结算状态

}
