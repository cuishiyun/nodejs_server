/**
 * date: 2019-01-28
 */

var Responses = {
    OK: 1,//表示成功 
    Invalid_params: -100,//表示参数不合法
    System_error: -101,//系统错误
    Illegal_account: -102,//非法账号
    Invalid_opt: -103,//非法操作
    Phone_is_register: -104,//手机号已经被绑定
    Phone_code_err: -105,//手机验证码错误
    Phone_code_outofdata: -106,//验证码过期
    UNAME_OR_UPWD_ERR: -107,//用户名或密码错误
    Rank_is_empty: -108,//排行榜为空

    Auth:{//登录模块验证码
        
     },
 };

module.exports = Responses;
