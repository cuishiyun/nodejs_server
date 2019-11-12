/**
 * auth协议
 * date: 2019-01-30
 */

 /**
  * 游客登录
  * 接收: stype, ctype, ukey -->string
  * 返回: stype, ctype, {status: ok (错误码的话就没有后面的)
  *    , uid, usex, unick, uface, uvip, ukey}
    ret['status'] = Responses.OK;
    ret['uid'] = data.uid;
    ret['unick'] = data.unick;
    ret['usex'] = data.usex;
    ret['uface'] = data.uface;
    ret['uvip'] = data.uvip;
    ret['ukey'] = data.guest_key;
    ret.is_guest = data.is_guest;
  
    
    服务器主动发送的重复登录:
    返回: stype, ctype, body: null
    
    修改用户资料: 
    接收: stype, ctype, {
        unick:
        usex:
    }

    返回: stype, ctype, {
        status: ok or 失败
        unick: 
        usex:
    }

    拉取用户账号升级的验证码: 4
    stype, ctype, {
        0: opt_code,//操作类型  0游客升级, 1修改密码, 2手机号注册
        1: phone_num,//电话号码
        2: guest_key//游客key
    }

    返回: stype, ctype, {
        status: ok or 失败  //状态码
    }

    绑定游客账号: 5
    stype, ctype, {
        0: phone,
        1: pwd_md5,
        2: phone code//手机验证码
    }
    返回: 

*/