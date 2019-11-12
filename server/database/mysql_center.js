/**
 * date: 2019-01-28
 * mysql 数据中心
0 */
var mysql = require("mysql");
var util = require('util');

var log = require('../utils/log.js');
var Responses = require('../apps/Responses.js');
var utils = require('../utils/utils.js');

var conn_pool = null;
function connect_to_center(host, port, db_name, uname, upwd) {
	conn_pool = mysql.createPool({
		host: host, // 数据库服务器的IP地址
		port: port, // my.cnf指定了端口，默认的mysql的端口是3306,
		database: db_name, // 要连接的数据库
		user: uname,
		password: upwd,
	});
}

// callback 1: err, 2, rows, 3, 每个字段的说明
// 异步,执行完后要等回掉，不是马上就有结果。
// 异步的mysql的操作能够提升我们的服务器的吞吐量；

function mysql_exec(sql, callback) {
	// getConnection 是从这个连接池里面获得mysql的连接通道,
	// 异步获取的，如果有结果了，就会调用一个回掉函数;
	// err, 是否有错误，如果没有错误err = null, 如果成功后面conn就是我们连接池
	// 返回給我们的和mysql server 进行通讯的句柄
	conn_pool.getConnection(function(err, conn) {
		if (err) { // 如果有错误信息
			if(callback) {
				log.error('连接数据库出错,message = ', err.message);
				callback(err, null, null);
			}
			return;
		}

		// query向服务器发送sql语句的命令，有返回的话，就会调用我们的回掉函数;
		conn.query(sql, function(sql_err, sql_result, fields_desic) {
			conn.release();//释放连接
			if (sql_err) {
				if (callback) {
					callback(sql_err, null, null);
				}
				return;
			}

			if (callback) {
				callback(null, sql_result, fields_desic);
			}
		});
		// end 
	});
}


/**
 * 通过用户名和密码查找
 * @param {*} uname 
 * @param {*} upwd 
 * @param {*} callback 
 */
function get_uinfo_by_uname_upwd(uname, upwd, callback){
	var sql = "select uid, unick, usex, uface, uvip, status, is_guest, guest_key from uinfo where uname = \"%s\" and upwd = \"%s\" and is_guest = 0";
	var sql_cmd = util.format(sql, uname, upwd);
	log.info(sql_cmd);
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}

		callback(Responses.OK, sql_ret);
	});
}

/**
 * 通过ukey获取用户信息
 * @param {*} ukey 
 */
function get_guest_uinfo_by_ukey(ukey, callback){
	var sql = "select uid, unick, usex, uface, uvip, status, is_guest, guest_key from uinfo where guest_key = \"%s\"";
	var sql_cmd = util.format(sql, ukey);
	log.info(sql_cmd);
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}

		callback(Responses.OK, sql_ret);

	});
}

function insert_guest_user(uface, unick, usex, ukey, callback){
	var sql = "insert into uinfo(`guest_key`, `unick`, `uface`, `usex`,`is_guest`) values(\"%s\", \"%s\", %d, %d,1)";
	var sql_cmd = util.format(sql, ukey, unick, uface, usex);
	log.info(sql_cmd);
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}
		callback(Responses.OK, null);//sql_ret
	});
}

/**
 * 修改用户信息
 */
function edit_profile(uid, unick, usex, callback){
	var sql = "update uinfo set unick=\"%s\", usex = %d where uid = %d";
	var sql_cmd = util.format(sql, unick, usex, uid);
	log.info(sql_cmd);
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}
		callback(Responses.OK, null);
	});
}

/**
 * 游客是否存在
 * @param {*} uid 
 * @param {*} callback 
 */
function is_exist_guest(uid, callback){
	var sql = "select is_guest, status from uinfo where uid = %d limit 1";
	var sql_cmd = util.format(sql, uid);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err || sql_ret.length <= 0){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}

		if(sql_ret[0].is_guest === 1 && sql_ret[0].status === 0){
			callback(Responses.OK, null);
			return;
		}
		callback(Responses.System_error, null);

	});

}

/**
 * 该手机号是否已经绑定过
 * @param {*} phone_num 
 * @param {*} callback 
 */
function is_phone_binded(phone_num, opt_type, callback){
	var sql = "select uid from uinfo where uname = \"%s\" limit 1";
	var sql_cmd = util.format(sql, phone_num);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}

		if(sql_ret.length <= 0){
			callback(Responses.OK, null);
			return;
		}
		callback(Responses.Phone_is_register, null);

	});

}

/**
 * 检查验证码是否合法
 * @param {*} phone_num 
 * @param {*} phone_code 
 * @param {*} opt_type 
 * @param {*} callback 
 */
function is_phone_code_valid(phone_num, phone_code, opt_type, callback){
	var sql = "select id, end_time from phone_chat where phone = \"%s\" and opt_type = %d and code = \"%s\" limit 1";
	var cur_time = utils.timestamp();
	var sql_cmd = util.format(sql, phone_num, opt_type, phone_code);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			callback(Responses.System_error, null);
			return;
		}

		if(sql_ret.length <= 0){
			callback(Responses.Phone_code_err, null);
			return;
		}

		if(sql_ret[0]['end_time'] < cur_time){
			//验证码已经过期
			callback(Responses.Phone_code_outofdata, null);
		}else{
			callback(Responses.OK, null);
		}

	});

}

/**
 * 对应操作的手机验证码是否存在
 * @param {} phone 
 * @param {*} opt 
 * @param {*} ret_func 
 */
function _is_phone_indentify_exist(phone, opt, ret_func){
	var sql = "select id from phone_chat where phone = \"%s\" and opt_type = %d ";
	var sql_cmd = util.format(sql, phone, opt);
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err || sql_ret.length <= 0){
			ret_func(Responses.System_error);
			return;
		}

		ret_func(Responses.OK);
	});

}
/**
 * 更新验证码
 * @param {*} code 
 * @param {*} phone 
 * @param {*} opt 
 * @param {*} end_duration 
 */
function _update_phone_indentify_time(code, phone, opt, end_duration){
	var end_time = utils.timestamp() + end_duration;
	var sql = "update phone_chat set code = \"%s\", end_time = %d, count=count+1 where phone=\"%s\" and opt_type = %d";
	var sql_cmd = util.format(sql, code, end_time, phone, opt);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			return;
		}


	});

}

/**
 * 插入验证码
 * @param {*} code 
 * @param {*} phone 
 * @param {*} opt 
 * @param {*} end_duration 
 */
function insert_phone_indentify(code, phone, opt, end_duration){
	var end_time = utils.timestamp() + end_duration;
	var sql = "insert into phone_chat(`phone`, `code`, `opt_type`, `end_time`, `count`) values(\"%s\", \"%s\", %d, %d, 1)";
	var sql_cmd = util.format(sql, phone, code, opt, end_time);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			return;
		}


	});
}

/**
 * 往数据库中插入验证码
 * @param {*} phone 
 * @param {*} opt 
 * @param {*} end_duration 
 * @param {*} ret_func 
 */
function update_phone_indentify(code, phone, opt, end_duration, ret_func){
	_is_phone_indentify_exist(phone, opt, function(status){
		//更新时间和操作次数
		if(status == Responses.OK){
			//更新操作次数
			_update_phone_indentify_time(code, phone, opt, end_duration);
		}else{
			//如果不存在,插入一条记录
			insert_phone_indentify(code, phone, opt, end_duration);
		}
		ret_func(Responses.OK, null);

	});

}

/**
 * 升级游客账号
 * @param {*} uid 
 * @param {*} phone 
 * @param {*} pwd 
 * @param {*} callback 
 */
function do_upgrade_guest_account(uid, phone, pwd, callback){
	var sql = "update uinfo set uname = \"%s\", upwd = \"%s\", is_guest = 0 where uid = %d";
	var sql_cmd = util.format(sql, phone, pwd, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			callback(Responses.System_error);
			return;
		}

		callback(Responses.OK);
	});
}

function insert_phone_account_user(uface, unick, usex, phone_num, pwd_md5, callback){
	var sql = "insert into uinfo(`uface`, `unick`, `usex`, `is_guest`, `uname`, `upwd`) values(%d, \"%s\", %d, 0, \"%s\", \"%s\")";
	var sql_cmd = util.format(sql, uface, unick, usex, phone_num, pwd_md5);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			callback(Responses.System_error);
			return;
		}

		callback(Responses.OK);
	});

}

function do_update_pwd(phone, pwd_md5, callback){
	var sql = "update uinfo set upwd = \"%s\" where uname = \"%s\"";
	var sql_cmd = util.format(sql, pwd_md5, phone);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			callback(Responses.System_error);
			return;
		}

		callback(Responses.OK);
	});
}

module.exports = {
	connect: connect_to_center,
	get_guest_uinfo_by_ukey: get_guest_uinfo_by_ukey,
	insert_guest_user: insert_guest_user,
	edit_profile: edit_profile,

	update_phone_indentify: update_phone_indentify,
	is_exist_guest: is_exist_guest,
	is_phone_binded: is_phone_binded,
	is_phone_code_valid: is_phone_code_valid,
	do_upgrade_guest_account: do_upgrade_guest_account,
	get_uinfo_by_uname_upwd: get_uinfo_by_uname_upwd,

	insert_phone_account_user: insert_phone_account_user,
	do_update_pwd: do_update_pwd,

};