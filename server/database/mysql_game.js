/**
 * date: 2019-02-15
 * mysql 数据中心
0 */
var mysql = require("mysql");
var util = require('util');

var log = require('../utils/log.js');
var Responses = require('../apps/Responses.js');
var utils = require('../utils/utils.js');

var conn_pool = null;
function connect_to_game_server(host, port, db_name, uname, upwd) {
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

function get_game_info_by_uid(uid, callback){
    var sql = "select uid, uexp, uchip, uvip, status from ugame where uid = %d";
	var sql_cmd = util.format(sql, uid);
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

function get_login_bonues_info(uid, callback){
    var sql = "select uid, bonues, days, bonues_time from login_bonues where uid = %d";
	var sql_cmd = util.format(sql, uid);
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

function insert_ugame_user(uid, uexp, uchip, callback){
    var sql = "insert into ugame(`uid`, `uexp`, `uchip`, `status`) values(%d, %d, %d, 0)";
	var sql_cmd = util.format(sql, uid, uexp, uchip);
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

function insert_user_login_bonues(uid, bonues, callback){
    var time = utils.timestamp();
    var sql = "insert into login_bonues(`days`, `bonues_time`, `bonues`, `uid`, `status`) values(%d, %d, %d, %d, 0)";
	var sql_cmd = util.format(sql, 1, time, bonues, uid);
    log.info(sql_cmd);
    
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			return;
		}
		callback(Responses.OK, null);//sql_ret
	});
}

function update_user_login_bonues(uid, bonues, days, callback){
	var time = utils.timestamp();//当前时间戳
	var sql = "update login_bonues set days=%d, bonues_time = %d, status = 0, bonues = %d where uid = %d";
	var sql_cmd = util.format(sql, days, time, bonues, uid);
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

function update_login_bonues_recved(bonues_id, callback){
	var time = utils.timestamp();//当前时间戳
	var sql = "update login_bonues set status = 1 where id = %d";
	var sql_cmd = util.format(sql, bonues_id);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			// callback(Responses.System_error, null);
			return;
		}
		// callback(Responses.OK, null);
	});
}

function get_login_bonues_info_by_uid(uid, callback){
	var sql = "select days, bonues, id, status from login_bonues where uid = %d";
	var sql_cmd = util.format(sql, uid);
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

//加减金币
function add_ugame_uchip(uid, uchip, is_add){
	if(is_add == false){
		uchip = -uchip;
	}

	var sql = "update ugame set uchip = uchip + %d where uid = %d"
	var sql_cmd = util.format(sql, uchip, uid);
    log.info(sql_cmd);
    
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic){
		if(err){
			log.error('数据库出错,message = ', err.message);
			return;
		}
	});
}

module.exports = {
    connect_to_game_server: connect_to_game_server,
    get_game_info_by_uid: get_game_info_by_uid,
    insert_ugame_user: insert_ugame_user,
    get_login_bonues_info: get_login_bonues_info,
    insert_user_login_bonues: insert_user_login_bonues,
	update_user_login_bonues: update_user_login_bonues,
	get_login_bonues_info_by_uid: get_login_bonues_info_by_uid,
	update_login_bonues_recved: update_login_bonues_recved,
	add_ugame_uchip: add_ugame_uchip,

};



