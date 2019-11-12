/**
 * 登录协议
 */
var utils = require('utils');
var Stype = require('Stype');
var Cmd = require('Cmd');
var websocket = require('websocket');
var ugame = require('ugame');
var md5 = require('md5');
require('auth_proto');

function guest_login(){
    var key = ugame.guest_key;//先从本地获取,如果未获取到则生成一个32位的key
    websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, key);
}

function uname_login(){
    var uname = ugame.uname;
    var upwd = ugame.upwd;
    upwd = md5(upwd);
    var body = {
        0: uname,
        1: upwd,  
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, body);
}

/**
 * 修改用户资料
 */
function edit_profile(body){
    websocket.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, body);
}

function get_guess_upgrade_verify_code(phone_num, guest_key){
    var body = {
        0: 0,//0表示绑定手机号获取验证码
        1: phone_num,
        2: guest_key
    };

    websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_IDENTIFY, body);
}

function guest_bind_phone(phone_num, pwd, identifying_code){
    var body = {
        0: phone_num,
        1: pwd,
        2: identifying_code,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, body);
}

function get_phone_reg_verify_code(phone_num){
    var body = {
        0: 1,// 1表示注册的时候拉取验证码
        1: phone_num,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VARIFY, body);
}

function reg_phone_account(unick, phone, pwd, verify_code){
    var body = {
        0: phone,
        1: pwd,
        2: verify_code,
        3: unick,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, body);
}

function get_forget_pwd_verify_code(phone_num){
    var body = {
        0: 2,// 2表示忘记密码拉取验证码
        1: phone_num,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.Get_forget_pwd_verify, body);
}

function reset_user_pwd(phone, pwd, verify_code){
    var body = {
        0: phone,
        1: pwd,
        2: verify_code,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.Reset_user_pwd, body);
}

var auth = {
    guest_login: guest_login,
    edit_profile: edit_profile,
    uname_login: uname_login,
    get_guess_upgrade_verify_code: get_guess_upgrade_verify_code,
    guest_bind_phone: guest_bind_phone,
    get_phone_reg_verify_code: get_phone_reg_verify_code,
    reg_phone_account: reg_phone_account,
    get_forget_pwd_verify_code: get_forget_pwd_verify_code,
    reset_user_pwd: reset_user_pwd,

};

module.exports = auth;