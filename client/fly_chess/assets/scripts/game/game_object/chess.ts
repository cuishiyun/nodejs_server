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
 * date: 2019-03-06
 *飞行棋棋子 
 */

import chessColor from "./chess_color";
import MapUtils from "../utils/MapUtils";


const {ccclass, property} = cc._decorator;

@ccclass
export default class chess extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    num: cc.Label = null;

    private m_linePosArray: cc.Vec2[] = [];
    private m_chessColor: number = -1;//棋的颜色
    private m_curIndex: number = -1;//棋子当前的索引  在数组内的索引值
    private m_move_dstIndex: number = -1;//目标索引
    private m_endIndex: number = -1;//棋子结束的位置
    private m_chessSrcPos: cc.Vec2 =  cc.v2(0, 0);//棋子的初始位置,被踢回家之后回到该位置

    private m_lineArray: number[] = [];

    // @property
    // text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.m_chessSrcPos = this.node.getPosition();
    }

    // update (dt) {}

    /**
     * 设置棋子的颜色
     * @param color 
     */
    public setColor(color: number): void{
        this.m_chessColor = color;
        this.loadJsonDataAndSetChessLine();
    }

    loadJsonDataAndSetChessLine(){
        var url = 'json/chess_position'; //'test.json';  //路径在assets/resources  不需要写resources路径
        cc.loader.loadRes(url, function(err, res){
            if(err){
                console.log('err = ' + JSON.stringify(err));
                return;
            }

            var chess_position = res.json;
            var line_position = chess_position['line_pos'];

            var url2 = 'json/chess_line'; //'test.json';  //路径在assets/resources  不需要写resources路径
            cc.loader.loadRes(url2, function(err, res){
                if(err){
                    console.log('err = ' + JSON.stringify(err));
                    return;
                }
                
                var line = res.json;
                if(this.m_chessColor == chessColor.Color_Red){
                    line = line['red'];
                }else if(this.m_chessColor == chessColor.Color_Yellow){
                    line = line['yellow'];
                }else if(this.m_chessColor == chessColor.Color_Blue){
                    line = line['blue'];
                }else if(this.m_chessColor == chessColor.Color_Green){
                    line = line['green'];
                }

                this.m_lineArray = line;
                this.m_endIndex = line[line.length - 1];
                var vec2Array: cc.Vec2[] = [];
                for(var key in line){
                    if(line_position[line[key]]){
                        vec2Array.push(cc.v2(line_position[line[key]][0], line_position[line[key]][1]));
                    }
                }
                this.setChessLine(vec2Array);

            }.bind(this));

        }.bind(this));
    },

    /**
     * 设置棋子的移动路径
     */
    private setChessLine(vec2Array: cc.Vec2[]): void{
        this.m_linePosArray = vec2Array;
    }

    /**
     * 棋子移动n步
     * check 移动结束之后是否检测可以跳棋子
     */
    public chessMoveStep(stepNum: number, check: boolean): void{
        if(this.m_curIndex >= (this.m_linePosArray.length - 1)){
            return;//当前棋子已经在终点了
        }
        this.m_move_dstIndex = this.m_move_dstIndex + stepNum;
        if(this.m_move_dstIndex > (this.m_linePosArray.length - 1)){
            this.m_move_dstIndex = (this.m_linePosArray.length - 1);
        }
        this.chessMoveOneStepCallBack(check);
    }
    
    /**
     * 棋子移动一步的回调函数
     * 移动结束之后是否检测
     */
    private chessMoveOneStepCallBack(check){
        if(this.m_curIndex == this.m_move_dstIndex){
            // console.log('移动结束, check = ' + check);

            if(check){
                if(this.m_chessColor == chessColor.Color_Red){
                    if(this.getBlockIndex() == 17){//跳到29  index 跳到
                        // console.log('红色- 捷径 跳格到29地块');
                        this.m_curIndex += 11;
                        this.m_move_dstIndex += 11;
                        this.chessMoveStep(1, false);
                        return;
                    }
                }else if(this.m_chessColor == chessColor.Color_Yellow){
                    if(this.getBlockIndex() == 30){//跳到42
                        // console.log('黄色- 捷径 跳格到42地块');
                        this.m_curIndex += 11;
                        this.m_move_dstIndex += 11;
                        this.chessMoveStep(1, false);
                        return;
                    }
                }else if(this.m_chessColor == chessColor.Color_Blue){
                    if(this.getBlockIndex() == 43){//跳到3
                        // console.log('蓝色- 捷径 跳格到3地块');
                        this.m_curIndex += 11;
                        this.m_move_dstIndex += 11;
                        this.chessMoveStep(1, false);
                        return;
                    }
                }else if(this.m_chessColor == chessColor.Color_Green){
                    if(this.getBlockIndex() == 4){//跳到16
                        // console.log('绿色- 捷径 跳格到16地块');
                        this.m_curIndex += 11;
                        this.m_move_dstIndex += 11;
                        this.chessMoveStep(1, false);
                        return;
                    }
                }
    
                if(this.getBlockIndex() <= 51){
                    //判断落点是不是在自己的颜色上
                    if(this.m_chessColor == MapUtils.getBlockColor(this.getBlockIndex())){
                        //向前跳4格
                        this.m_curIndex += 3;
                        this.m_move_dstIndex += 3;
                        this.chessMoveStep(1, false);
                        return;
                    }
                }
                //check end
            }

            //判断格子上有没有其他人的棋子,如果有就踢回家


            return;
        }

        this.m_curIndex += 1;
        var callFunc = cc.callFunc(function(){
            this.chessMoveOneStepCallBack(check);
         }, this);
         this.node.runAction(cc.sequence(cc.moveTo(0.3, this.m_linePosArray[this.m_curIndex]), callFunc));
    }

    /**
     * 获取棋子所在的地块索引
     */
    public getBlockIndex(): number{
        return this.m_lineArray[this.m_curIndex];
    }

}
