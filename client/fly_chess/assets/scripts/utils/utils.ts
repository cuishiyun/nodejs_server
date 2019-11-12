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
 * utils工具类
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class utils{

    /**
     * 随机生成字符串
     * @param {*} len 
     */
    public static random_string(len: number): string{
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; 
        
        var maxPos = $chars.length;
    　　var str = '';
    　　for (var i = 0; i < len; i++) {
    　　　　str += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return str;
    }
    
    /**
     * 随机生成int类型的随机数
     * @param {*} len 
     */
    public static random_int_str(len: number): string {
        var $chars = '0123456789'; 
        
        var maxPos = $chars.length;
    　　var str = '';
    　　for (var i = 0; i < len; i++) {
    　　　　str += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return str;
    }
    
    // 随机的生成[begin, end] 范围内的数据
    public static random_int(begin: number, end: number): number {
        var num = begin + Math.random() * (end - begin + 1);
        num = Math.floor(num);
        if (num > end) {
            num = end;
        }
        return num;
    }

}
