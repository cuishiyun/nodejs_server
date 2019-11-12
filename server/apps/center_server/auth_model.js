/**
 * auth协议处理
 * date: 2019-01-28
 */

var Responses = require('../Responses.js');
var mysql_center = require('../../database/mysql_center.js');
var redis_center = require('../../database/redis_center.js');
var utils = require('../../utils/utils.js');
var log = require('../../utils/log.js');
var phone_msg = require('../phone_msg.js');

function guest_login_success(data, ret_func){
    var ret = {};
    //游客登录成功
    ret['status'] = Responses.OK;
    ret['uid'] = data.uid;//后面的为数据库的字段，前面为回给客户端的字段
    ret['unick'] = data.unick;
    ret['usex'] = data.usex;
    ret['uface'] = data.uface;
    ret['uvip'] = data.uvip;
    ret['ukey'] = data.guest_key;
    ret.is_guest = data.is_guest;

    redis_center.set_uinfo_inredis(data.uid, {
        unick: data.unick,
        uface: data.uface,
        usex: data.usex,
        uvip: data.uvip,
        is_guest: 1,
    })

    ret_func(ret);
}

function uname_login_success(data, ret_func){
    var ret = {};
    //登录成功
    ret['status'] = Responses.OK;
    ret['uid'] = data.uid;//后面的为数据库的字段，前面为回给客户端的字段
    ret['unick'] = data.unick;
    ret['usex'] = data.usex;
    ret['uface'] = data.uface;
    ret['uvip'] = data.uvip;
    ret.is_guest = data.is_guest;

    redis_center.set_uinfo_inredis(data.uid, {
        unick: data.unick,
        uface: data.uface,
        usex: data.usex,
        uvip: data.uvip,
        is_guest: 0,
    })

    ret_func(ret);
}

function edit_profile_success(data, unick, usex, ret_func){
    var ret = {};
    ret.status = Responses.OK;
    ret.unick = unick;
    ret.usex = usex;
    ret_func(ret);
}

function write_err(status, ret_func){
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

function edit_profile(uid, unick, usex, ret_func){
    mysql_center.edit_profile(uid, unick, usex, function(status, data){
        if(status != Responses.OK){
            write_err(status, ret_func);
        }

        edit_profile_success(data, unick, usex,ret_func);
    });
}

function guest_login(ukey, ret_func){
    var unick = '游客' + utils.random_int_str(4);//游客1234
	var usex = utils.random_int(0, 1);//随机性别
    var uface = 0;//随机头像

    //查询数据库有无用户
    mysql_center.get_guest_uinfo_by_ukey(ukey, function(status, data){
        if(status != Responses.OK){
            write_err(status, ret_func);
            return;
        }

        //没有找到, 注册一个用户
        if(data.length <= 0){
            mysql_center.insert_guest_user(uface, unick, usex, ukey, function(status, data){
                if(status != Responses.OK){
                    write_err(status, ret_func);
                    return;
                }
                //重新查询获取uid
                guest_login(ukey, ret_func);
            });
        }else{
            if(data[0].status != 0){//游客账号被封
                write_err(Responses.Illegal_account, ret_func);
                return;
            }
            log.info('data = ' + JSON.stringify(data));

            if(data[0].is_guest != 1){//不是游客账号
                write_err(Responses.Invalid_opt, ret_func);
                return;
            }

            guest_login_success(data[0], ret_func);
        }
       
    });

}

function uname_login(uname, upwd, ret_func){
    //查询数据库有无用户
    mysql_center.get_uinfo_by_uname_upwd(uname, upwd, function(status, data){
        if(status != Responses.OK){
            write_err(status, ret_func);
            return;
        }

        //没有找到
        if(data.length <= 0){
            write_err(Responses.UNAME_OR_UPWD_ERR, ret_func);
        }else{
            if(data[0].status != 0){//游客账号被封
                write_err(Responses.Illegal_account, ret_func);
                return;
            }

            uname_login_success(data[0], ret_func);
        }
       
    });

}

/**
 * 发送验证码
 * @param {*} phone 
 * @param {*} opt 
 * @end_duration 单位是s
 */
function _send_indentify_code(phone, opt, end_duration, ret_func){
    var code = utils.random_int_str(4);

    //把code插入到数据库中
    mysql_center.update_phone_indentify(code, phone, opt, end_duration, function(status){
        if(status == Responses.OK){
            //发送短信
            phone_msg.send_indentify_code(phone, code);
        }

        ret_func(status);
    });

}

/**
 * 获取游客升级验证码
 * @param {*} uid 
 * @param {*} guest_key 
 * @param {*} phone_num 
 */
function get_guest_upgrade_indentify(uid, ukey, phone, opt, ret_func){
    //判断账号的合法性
    mysql_center.is_exist_guest(uid, function(stauts){
        if(stauts != Responses.OK){
            ret_func(status);
            return;
        }

        _send_indentify_code(phone, opt, 300, ret_func);
    });

}

//账号升级
function do_bind_guest_account(uid, phone_num, pwd_md5, phone_code, opt_type, ret_func){
    mysql_center.do_upgrade_guest_account(uid, phone_num, pwd_md5, function(status){
        ret_func(status);
    });
}

function _check_guest_upgrade_phone_code_is_valid(uid, phone_num, pwd_md5, phone_code, opt_type, ret_func){
    mysql_center.is_phone_code_valid(phone_num, phone_code, opt_type, function(stauts){
        if(stauts != Responses.OK){
            ret_func(stauts);
            return;
        }

        //账号升级  更新数据库,返回结果
        do_bind_guest_account(uid, phone_num, pwd_md5, phone_code, opt_type, ret_func);
    });
}

/**
 * 检查手机号是否已经被绑定
 * @param {*} phone_num 
 * @param {*} phone_code 
 * @param {*} ret_func 
 */
function _check_phone_is_binded(uid, phone_num, pwd_md5, phone_code, opt_type, ret_func){
    mysql_center.is_phone_binded(phone_num, opt_type, function(status){
        if(status != Responses.OK){
            ret_func(Responses.Invalid_opt);
            return;
        }

        //该手机号可以绑定  检查验证码是否过期
        _check_guest_upgrade_phone_code_is_valid(uid, phone_num, pwd_md5, phone_code, opt_type, ret_func);
    });

}

/**
 * 游客绑定手机号
 * @param {*} uid 用户id
 * @param {*} phone_num 手机号
 * @param {*} pwd_md5 密码
 * @param {*} phone_code 手机验证码
 * @param {*} ret_func 回调函数
 */
function guest_bind_phone_number(uid, phone_num, pwd_md5, phone_code, ret_func){
    //1: 判断账号合法性
    mysql_center.is_exist_guest(uid, function(stauts){
        if(stauts != Responses.OK){
            ret_func(status);
            return;
        }

        //2: 检查该手机号是否已经被绑定
        _check_phone_is_binded(uid, phone_num, pwd_md5, phone_code, 0, ret_func);
    });
}

/**
 * 手机注册获取验证码
 * @param {*} phone_num 
 * @param {*} opt_type 为1
 * @param {*} ret_func 
 */
function get_phone_reg_verify_code(phone_num, opt_type, ret_func){
    mysql_center.is_phone_binded(phone_num, opt_type, function(status){
        if(status != Responses.OK){
            ret_func(status);
            return;
        }

        _send_indentify_code(phone_num, opt_type, 300, ret_func);
    });
}

//忘记密码获取验证码 opt_type = 2
function get_forget_pwd_verify_code(phone_num, opt_type, ret_func){
    mysql_center.is_phone_binded(phone_num, opt_type, function(status){
        if(status == Responses.Phone_is_register){
            _send_indentify_code(phone_num, opt_type, 300, ret_func);
        }else{
            if(status != Responses.OK){
                ret_func(status);
            }
            return;
        }

    });
}

function _do_reg_phone_account(phone_num, pwd_md5, phone_code, unick, opt_type, ret_func){
    var usex = utils.random_int(0, 1);//性别
    var uface = 0;//默认的头像

    mysql_center.insert_phone_account_user(uface, unick, usex, phone_num, pwd_md5, function(status){
        if(status != Responses.OK){
            write_err(status, ret_func);
            return;
        }
        
        ret_func(status);
    });
}

function _do_forget_pwd(phone_num, pwd_md5, phone_code, opt_type, ret_func){
    mysql_center.do_update_pwd(phone_num, pwd_md5, function(status){
        if(status != Responses.OK){
            write_err(status, ret_func);
            return;
        }
        
        ret_func(status);
    });
}

function _check_reg_phone_account_verify_code(phone_num, pwd_md5, phone_code, unick, opt_type, ret_func){
    mysql_center.is_phone_code_valid(phone_num, phone_code, opt_type, function(stauts){
        if(stauts != Responses.OK){
            ret_func(stauts);
            return;
        }

        //创建账号  更新数据库,返回结果
        _do_reg_phone_account(phone_num, pwd_md5, phone_code, unick, opt_type, ret_func);
    });
}

function _check_forget_pwd_verify_code(phone_num, pwd_md5, phone_code, opt_type, ret_func){
    mysql_center.is_phone_code_valid(phone_num, phone_code, opt_type, function(stauts){
        if(stauts != Responses.OK){
            ret_func(stauts);
            return;
        }

        //修改密码  更新数据库,返回结果
        _do_forget_pwd(phone_num, pwd_md5, phone_code, opt_type, ret_func);
    });
}

/**
 * 注册手机账号
 * @param {*} phone_num 
 * @param {*} pwd_md5 
 * @param {*} verify_code 
 * @param {*} unick 
 * @param {*} ret_func 
 */
function reg_phone_account(phone_num, pwd_md5, verify_code, unick, ret_func){
    var temp_opt_type = 1;
    mysql_center.is_phone_binded(phone_num, temp_opt_type, function(status){
        if(status != Responses.OK){
            ret_func(status);
            return;
        }

        //检查验证码
        _check_reg_phone_account_verify_code(phone_num, pwd_md5, verify_code, unick, temp_opt_type, ret_func);
    });
}

/**
 * 重置用户密码
 * @param {*} phone 
 * @param {*} pwd_md5 
 * @param {*} verify_code 
 * @param {*} ret_func 
 */
function reset_user_pwd(phone_num, pwd_md5, verify_code, ret_func){
    var temp_opt_type = 2;
    mysql_center.is_phone_binded(phone_num, temp_opt_type, function(status){
        if(status == Responses.Phone_is_register){
            //检查验证码
            _check_forget_pwd_verify_code(phone_num, pwd_md5, verify_code, temp_opt_type, ret_func);
        }else{
            if(status != Responses.OK){
                ret_func(status);
            }
            return;
        }

    });
}

module.exports = {
    guest_login: guest_login,
    uname_login: uname_login,
    edit_profile: edit_profile,
    get_guest_upgrade_indentify: get_guest_upgrade_indentify,
    guest_bind_phone_number: guest_bind_phone_number,
    get_phone_reg_verify_code: get_phone_reg_verify_code,
    reg_phone_account: reg_phone_account,
    get_forget_pwd_verify_code: get_forget_pwd_verify_code,
    reset_user_pwd: reset_user_pwd,

};

