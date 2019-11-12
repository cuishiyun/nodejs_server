/**
 * webserver --- express实现
 * date: 2019-02-27
 * 热更新
 * 支付
 * 系统配置
 * 
 */

var express = require("express");
var path = require("path");
var fs = require('fs');
var log = require('../../utils/log.js');

var game_config = require('../game_config.js');
var Cmd = require('../../apps/Cmd.js');
var Stype = require('../../apps/Stype.js');
var Responses = require('../../apps/Responses.js');

// if(process.argv.length < 3){
// 	console.log("node webserver.js port");
// 	return;
// }

var app = express();
var host = game_config.webserver.host;
var port = game_config.webserver.port;//parseInt(process.argv[2]);

// // process.chdir("./apps/webserver");
// // console.log(process.cwd());

// console.log(process.execPath);//node.exe的路径
// console.log(__dirname);//代码存放的路径
// console.log(process.cwd());//当前执行程序的路径

if(fs.existsSync('../www_root')){
	app.use(express.static(path.join(process.cwd(), "../www_root")));// + "/apps/webserver"
}else{
	log.warn('www_root is not exist !');
}

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//获取客户端连接的服务器信息的ip地址 http://127.0.0.1:10001/server_info
app.get('/server_info', function(request, response){
	var data = {
		host: game_config.GATEWAY_CONNECT_IP,
		tcp_port: game_config.gateway_config.ports[0],
		ws_port: game_config.gateway_config.ports[1],
	};

	var str_data = JSON.stringify(data);
	response.send(str_data);
	response.end();
});

app.listen(port);//启动web服务器

log.info('webserver started at host '+ host + ' port ' + port);
