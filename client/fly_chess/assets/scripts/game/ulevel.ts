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
 * 获取经验
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class ulevel {

    //经验差
    public static level_exp: Array = [0, 1000, 2000, 2000, 3000, 3000, 4000, 4000, 8000, 8000, 9000, 9000];

    //等级, 百分比
    public static get_level(exp: number): any {
        var ret = [0, 0];

        var level = 0;
        var last_exp = exp;
        for (var i = 1; i < level_exp.length; i++) {
            if (last_exp < level_exp[i]) {
                ret[0] = level;
                ret[1] = last_exp / level_exp[i];
                return ret;
            }

            last_exp -= level_exp[i];
            level = i;
        }

        //已经是最高等级
        ret[0] = level;
        ret[1] = 1;

        return ret;
    }

}
