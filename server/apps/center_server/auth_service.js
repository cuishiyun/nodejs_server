/*
	服务模板  如聊天室服务等
	date: 2019-01-22
*/
var log = require('../../utils/log.js');
var Cmd = require('../Cmd.js');
var auth_model = require('./auth_model.js');
var Responses = require('../Responses.js');
var Stype = require('../Stype.js');
var utils = require('../../utils/utils.js');
require('./auth_proto.js');

function guest_login(session, utag, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, Responses.Invalid_params, utag, proto_type);
		return;
	}
	
	var ukey = body;
	auth_model.guest_login(ukey, function(ret){
		//返回给客户端
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, ret, utag, proto_type);
	});

}

function uname_login(session, utag, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, Responses.Invalid_params, utag, proto_type);
		return;
	}
	
	var uname = body['0'];
	var upwd = body['1'];
	auth_model.uname_login(uname, upwd, function(ret){
		session.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, ret, utag, proto_type);
	});
}

function edit_profile(session, uid, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, Responses.Invalid_params, utag, proto_type);
		return;
	}

	var tempunick = body.unick;
	var tempusex = body.usex;
	auth_model.edit_profile(uid, tempunick, tempusex, function(body){
		//返回给客户端
		session.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, body, uid, proto_type);
	});

}

function is_phone_number(num){
	if(num.length != 11){
		return false;
	}
	
	for(var i = 0; i < num.length; i++){
		var ch = num.charAt(i);
		if(ch < '0' || ch > '9'){
			return false;
		}
	}

	return true;
}

/**
 * 游客升级拉取验证码
 * @param {*} session 
 * @param {*} uid 
 * @param {*} proto_type 
 * @param {*} body 
 */
function get_guest_upgrade_indentify(session, uid, proto_type, body){
	//验证数据合法性
	if(!body || !is_phone_number(body['1'])){
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_IDENTIFY, Responses.Invalid_params, uid, proto_type);
		return;
	}

	var opt_type = body['0'];
	var phone_num = body['1'];
	var guest_key = body['2'];
	// log.error(opt_type, phone_num, guest_key);

	auth_model.get_guest_upgrade_indentify(uid, guest_key, phone_num, opt_type, function(body){
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_IDENTIFY, body, uid, proto_type);
	});

}

//游客绑定手机
function guest_bind_phone_num(session, uid, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, Responses.Invalid_params, uid, proto_type);
		return;
	}

	auth_model.guest_bind_phone_number(uid, body['0'], body['1'], body['2'], function(status){
		session.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, status, uid, proto_type);
	});
}

function get_phone_reg_verify_code(session, utag, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VARIFY, Responses.Invalid_params, utag, proto_type);
		return;
	}

	//phone, opt_type
	auth_model.get_phone_reg_verify_code(body['1'], body['0'], function(status){
		session.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VARIFY, status, utag, proto_type);
	});

}

function get_forget_pwd_verify_code(session, utag, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.Get_forget_pwd_verify, Responses.Invalid_params, utag, proto_type);
		return;
	}
	
	//phone, opt_type
	auth_model.get_forget_pwd_verify_code(body['1'], body['0'], function(status){
		session.send_cmd(Stype.Auth, Cmd.Auth.Get_forget_pwd_verify, status, utag, proto_type);
	});
}

//注册手机账号
function reg_phone_account(session, utag, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, Responses.Invalid_params, utag, proto_type);
		return;
	}

	auth_model.reg_phone_account(body['0'], body['1'], body['2'], body['3'], function(status){
		session.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, {
			status: status,
		}, utag, proto_type);
	});
}

function reset_user_pwd(session, utag, proto_type, body){
	//验证数据合法性
	if(!body){
		session.send_cmd(Stype.Auth, Cmd.Auth.Reset_user_pwd, Responses.Invalid_params, utag, proto_type);
		return;
	}

	//phone, pwd_md5, verify_code
	auth_model.reset_user_pwd(body['0'], body['1'], body['2'], function(status){
		session.send_cmd(Stype.Auth, Cmd.Auth.Reset_user_pwd, status, utag, proto_type);
	});
}

var service = {
	name: 'auth_service',//服务名称
	is_transfer: false,//是否为转发模块
	
	/**
	 * 收到客户端给我们发过来的数据
	 * @param {*} session 
	 * @param {*} ctype 
	 * @param {*} body 
	 * @param {*} raw_cmd 为未解开的cmd,如果是网关只需要转发
	 */
	on_recv_player_cmd:  function(session, stype, ctype, body, utag, proto_type, raw_cmd){
		log.info('auth ', stype, ctype, 'utag = ', utag, body);
		switch(ctype){
			case Cmd.Auth.GUEST_LOGIN:
			{
				guest_login(session, utag, proto_type,body);
			}
			break;
			case Cmd.Auth.EDIT_PROFILE:
			{
				edit_profile(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.GUEST_UPGRADE_IDENTIFY:
			{
				// log.info('获取验证码',body, ',utag = ' + utag);
				get_guest_upgrade_indentify(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.BIND_PHONE_NUM://绑定游客账号
			{
				guest_bind_phone_num(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.UNAME_LOGIN://用户名密码登录
			{
				uname_login(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.GET_PHONE_REG_VARIFY:
			{//获取手机验证码
				get_phone_reg_verify_code(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.PHONE_REG_ACCOUNT:
			{//注册账号
				reg_phone_account(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.Get_forget_pwd_verify:
			{//忘记密码获取验证码
				get_forget_pwd_verify_code(session, utag, proto_type, body);
			}
			break;
			case Cmd.Auth.Reset_user_pwd:
			{//重置密码
				reset_user_pwd(session, utag, proto_type, body);
			}
			break;
			case Cmd.User_Disconnect:
				log.warn('用户' + utag + '掉线');
			break;
			default:
				log.error('auth模块不能识别ctype = ', ctype);
			break;
		}
	},

	/**
	 * 收到连接的服务给我们发过来的数据
	 */
	on_recv_server_return: function(session, stype, ctype, body, utag, proto_type, raw_cmd){

	},

	/**
	 * 收到客户端断开连接  网关挂了
	 * @param {*} session 
	 */
	on_player_disconnect: function(stype, uid){

	},

};

module.exports = service;