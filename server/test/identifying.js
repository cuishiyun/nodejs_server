var http = require("http");
var util = require("util");

function send_phone_chat(phone_num,  content) {
	var cmd_url = "http://api.cnsms.cn/?ac=send&uid=117000&pwd=9A27BF288337541C87D3EE9FE3A18ACA&mobile=%s&content=%s&encode=utf8";
	content = encodeURI(content);

	var url = util.format(cmd_url, phone_num, content);
	console.log(url);

	http.get(url, function(incoming_msg) {
		console.log("respones status " + incoming_msg.statusCode);
		incoming_msg.on("data", function(data) {
			if (incoming_msg.statusCode === 200) {
				console.log(data.toString());
			}
			else {

			}
		});
	})
}

send_phone_chat("18515120919", "hello");
