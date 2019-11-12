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
 * 地图工具类
 * date: 2019-03-06
 */

import chessColor from "../game_object/chess_color";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapUtils {

    private static greenBlockIndexArray: number[] = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48];//, 52, 53, 54, 55, 56, 57
    private static redBlockIndexArray: number[] = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49];//, 58, 59, 60, 61, 62, 63
    private static yellowBlockIndexArray: number[] = [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50];//, 64, 65, 66, 67, 68, 69
    private static blueBlockIndexArray: number[] = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51];//, 70, 71, 72, 73, 74, 75

    /**
     * 获得地块index的颜色
     * @param blockIndex 
     */
    public static getBlockColor(blockIndex: number): number{
        //红
        for(var key in MapUtils.redBlockIndexArray){
            if(MapUtils.redBlockIndexArray[key] == blockIndex){
                return chessColor.Color_Red;
            }
        }

        //黄
        for(var key in MapUtils.yellowBlockIndexArray){
            if(MapUtils.yellowBlockIndexArray[key] == blockIndex){
                return chessColor.Color_Yellow;
            }
        }

        //蓝
        for(var key in MapUtils.blueBlockIndexArray){
            if(MapUtils.blueBlockIndexArray[key] == blockIndex){
                return chessColor.Color_Blue;
            }
        }

        //绿
        for(var key in MapUtils.greenBlockIndexArray){
            if(MapUtils.greenBlockIndexArray[key] == blockIndex){
                return chessColor.Color_Green;
            }
        }

        return -1;
    }

}
