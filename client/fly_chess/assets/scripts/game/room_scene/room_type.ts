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
 * date: 2019-03-05
 * 房间类型
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class room_type {

    public static type_none: number = -1;
    public static type_22: number = 1;//2人场, 2个棋子
    public static type_24: number = 2;//2人场，4个棋子
    public static type_42: number = 3;//4人场，2个棋子
    public static type_44: number = 4;//4人场，4个棋子

}
