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
 * 服务器返回的响应码
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class Responses{
    public static OK: number = 1;//表示成功 
    public static Invalid_params: number = -100;//表示参数不合法
    public static System_error: number = -101;//系统错误
    public static Illegal_account: number = -102;//非法账号
    public static nvalid_opt: number = -103;//非法操作
    public static Phone_is_register: number = -104;//手机号已经被绑定
    public static Phone_code_err: number = -105;//手机验证码错误
    public static Phone_code_outofdata: number = -106;//验证码过期
    public static UNAME_OR_UPWD_ERR: number = -107;//用户名或密码错误
    public static Rank_is_empty: number = -108;//排行榜为空
    
}
