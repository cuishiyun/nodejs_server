/**
 * 房间
 * date: 2019-02-20
 * 
 *    this.inview_players = [];//保存旁观区的玩家
 *     this.seats = [];//保存座位上的玩家
 */

var log = require('../../utils/log.js');
var Stype = require('../../apps/Stype.js');
var Cmd = require('../../apps/Cmd.js');
var Responses = require('../../apps/Responses.js');
var redis_center = require('../../database/redis_center.js');
var mysql_game = require('../../database/mysql_game.js');
var utils = require('../../utils/utils.js');
var proto_man = require('../../netbus/proto_man.js');
var State = require('../../apps/State.js');
var QuitReason = require('../../apps/game_server/QuitReason.js');

var five_chess_model = require('./five_chess_model.js');

var INVIEW_SEATS = 20;//运行的旁观人数
var GAME_SEAT = 2;//2个人玩游戏
var DISK_SIZE = 15;//棋盘的大小  15 * 15

//棋子的颜色
var ChessType = {
    None: 0,
    Black: 1,
    White: 2,
};

function write_err(status, ret_func) {
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

//构造函数
function five_chess_room(room_id, zone_config) {
    this.zid = zone_config.zid;//桌子当前所属的区间
    this.room_id = room_id;//房间号
    this.think_time = zone_config.think_time;//思考时间
    this.min_chip = zone_config.min_chip;//最小金币 玩家有可能一直玩游戏,金币输没了
    this.bet_chip = zone_config.one_round_chip;

    this.state = State.Ready;//房间状态

    //game相关
    this.black_rand = true;//随机生成黑色的玩家
    this.black_seatid = -1;//黑色玩家的座位id
    this.cur_seatid = -1;//当前轮到的玩家

    //超时的定时器对象
    this.action_timer = null;//需要开启和取消
    this.action_timeout_timestamp = 0;//玩家超时的时间戳
    //end

    // 0-20
    this.inview_players = [];//保存旁观区的玩家
    for (var i = 0; i < INVIEW_SEATS; i++) {
        this.inview_players.push(null);
    }

    this.seats = [];//保存座位上的玩家
    for (var i = 0; i < GAME_SEAT; i++) {
        this.seats.push(null);
    }

    //创建棋盘  15 * 15
    this.chess_disk = [];//保存棋盘的每个位置
    for (var i = 0; i < DISK_SIZE * DISK_SIZE; i++) {
        this.chess_disk.push(ChessType.None);
    }
    //end
}

//重置棋盘
five_chess_room.prototype.reset_chess_disk = function () {
    for (var i = 0; i < DISK_SIZE * DISK_SIZE; i++) {
        this.chess_disk[i] = ChessType.None;
    }
}

five_chess_room.prototype.search_empty_seat_inview = function () {
    for (var i = 0; i < INVIEW_SEATS; i++) {
        if (this.inview_players[i] == null) {
            return i;
        }
    }
    return -1;
}

//玩家进入房间
five_chess_room.prototype.do_enter_room = function (player) {
    var inview_seat = this.search_empty_seat_inview();
    if (inview_seat < 0) {
        log.info('旁观座位已满.');
        return;
    }

    this.inview_players[inview_seat] = player;
    player.room_id = this.room_id;
    player.enter_room(this);

    //广播给所有人,有玩家进来了  如果觉得有必要,可以进行广播
    //this.room_boradcast(Stype.Game5Chess, 1000, {0: 'hello, wangmingdi'}, null);

    //把已经存在的玩家发送给刚进来的玩家
    for (var i = 0; i < GAME_SEAT; i++) {
        var other = this.seats[i];
        if (other == null) {
            continue;
        }

        //把玩家坐下的消息广播给房间里面的所有玩家(不包括自己)
        var body = this.get_user_arrived(other);
        player.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.User_arrived, body);
    }
    //end

    log.info('player uid = ' + player.uid + ' enter zone = ' + this.zid + ' room_id = ' + this.room_id);
    //服务器主动告诉客户端,用户进入了桌子---自动配桌
    var body = {
        0: Responses.OK,
        1: this.zid,
        2: this.room_id,
        //... 其他的房间信息
    };
    player.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Enter_room, body);

    //自动分配一个座位给玩家
    this.do_sitdown(player);
}

//获取玩家到达需要的数据
five_chess_room.prototype.get_user_arrived = function(other){
    var body = {
        0: other.seatid,
        //玩家信息
        1: other.unick,
        2: other.usex,
        3: other.uface,
        //游戏信息
        4: other.uchip,
        5: other.uexp,
        6: other.uvip,

        7: other.state
    };
    return body;
}

//玩家离开房间
five_chess_room.prototype.do_exit_room = function (player, quit_reason) {
    ////不能退出,走断线重连
    if(quit_reason == QuitReason.UserLostConnect
        && this.state == State.Playing
        && player.state == State.Playing){
            return false;
    }
    //end
    
    var winner = null;
    //... 判断玩家是否正在游戏 等等
    //end
    if (player.seatid != -1) {
        if(player.state == State.Playing){
            //当前正在游戏,用户强制退出了  逃跑,算对家赢了
            var winner_seatid = GAME_SEAT - player.seatid - 1;
            winner = this.seats[winner_seatid];
        }

        var seatid = player.seatid;
        log.info('player ' + player.uid + ' leave seat ' + player.seatid);
        // //发送消息给客户端,玩家站起
        // var body = {
        //     0: Responses.OK,
        //     1: player.seatid,
        // };
        // player.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Standup, body);

        if(winner){//结算
            this.checkout_game(1, winner);
        }

        //广播给本房间中所有的玩家(包括自己) -- 玩家站起   坐下->旁观
        var body = {
            0: Responses.OK,
            1: seatid,
        };
        this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.Standup, body, null);
        //end

        //服务器清空玩家座位信息
        player.standup(this);
        this.seats[player.seatid] = null;
        player.seatid = -1;
    }

    //把玩家从旁观列表中删除
    for (var i = 0; i < INVIEW_SEATS; i++) {
        if (this.inview_players[i] == player) {
            this.inview_players[i] = null;
        }
    }

    player.exit_room(this);
    player.room_id = -1;

    //广播给所有的玩家  --- 玩家离开房间
    //end

    log.info('player uid = ' + player.uid + ' leave zone ' + this.zid + ' room_id = ' + this.room_id);

    return true;
}

//玩家坐下
five_chess_room.prototype.do_sitdown = function (player) {
    if (player.seatid != -1) {
        return;
    }

    //搜索一个可用的座位号
    var sv_seat = this.search_empty_seat();
    if (sv_seat == -1) {//不能坐下，只能旁观
        return;
    }

    log.info('player ' + player.uid + ' sitdown at ' + sv_seat);
    this.seats[sv_seat] = player;
    player.seatid = sv_seat;

    player.sitdown(this);

    //发送消息给客户端,玩家坐下
    var body = {
        0: Responses.OK,
        1: sv_seat,
    };
    player.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Sitdown, body);

    //把玩家坐下的消息广播给房间里面的所有玩家(不包括自己)
    var body = this.get_user_arrived(player);
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.User_arrived, body, player.uid);
    //end
}

//获取房间是否有空的座位
five_chess_room.prototype.empty_seat = function () {
    var num = 0;
    for (var i in this.seats) {
        if (this.seats[i] == null) {
            num++;
        }
    }
    return num;
}

//找一个空位
five_chess_room.prototype.search_empty_seat = function () {
    for (var i = 0; i < GAME_SEAT; i++) {
        if (this.seats[i] == null) {
            return i;
        }
    }
    return -1;
}

//基于旁观列表来广播
five_chess_room.prototype.room_boradcast = function (stype, ctype, body, not_to_uid) {
    var json_uid = [];
    var buf_uid = [];

    var cmd_json = null;
    var cmd_buf = null;

    var gw_session = null;//默认只有一个网关

    for (var i = 0; i < this.inview_players.length; i++) {
        if (this.inview_players[i] == null
            || this.inview_players[i].session == null
            || this.inview_players[i].uid == not_to_uid) {
            continue;
        }

        gw_session = this.inview_players[i].session;
        if (this.inview_players[i].proto_type == proto_man.PROTO_JSON) {
            json_uid.push(this.inview_players[i].uid);
            if (!cmd_json) {
                cmd_json = proto_man.encode_cmd(0, proto_man.PROTO_JSON, stype, ctype, body);
            }
        } else if (this.inview_players[i].proto_type == proto_man.PROTO_BUF) {
            buf_uid.push(this.inview_players[i].uid);
            if (!cmd_buf) {
                cmd_buf = proto_man.encode_cmd(0, proto_man.PROTO_BUF, stype, ctype, body);
            }
        }
    }

    if (json_uid.length > 0) {
        var body = {
            cmd_buf: cmd_json,
            users: json_uid,
        };
        //发送给网关
        gw_session.send_cmd(Stype.Broadcast, Cmd.BroadCast, body, 0, proto_man.PROTO_BUF);
    }

    if (buf_uid.length > 0) {
        var body = {
            cmd_buf: cmd_buf,
            users: buf_uid,
        };
        //发送给网关
        gw_session.send_cmd(Stype.Broadcast, Cmd.BroadCast, body, 0, proto_man.PROTO_BUF);
    }

}

five_chess_room.prototype.send_prop = function (player, to_seatid, prop_id, ret_func) {
    if (player.seatid == -1) {
        //player未坐下
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    if (player != this.seats[player.seatid]) {
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    if (!this.seats[to_seatid]) {
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    if (prop_id <= 0 || prop_id > 5) {
        write_err(Responses.Invalid_params, ret_func);
        return;
    }

    //给房间所有人广播
    var body = {
        0: Responses.OK,
        1: player.seatid,
        2: to_seatid,
        3: prop_id,
    };
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.Send_prop, body);

}

//玩家准备
five_chess_room.prototype.do_player_ready = function (player, ret_func) {
    //当前房间是否为准备好了
    if (this.state != State.Ready || player.state != State.InView) {
        write_err(Responses.Invalid_opt, ret_func)
        return;
    }

    //玩家是否已经在该房间坐下
    if (player != this.seats[player.seatid]) {
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    player.do_ready(this);

    //广播给房间里所有的人
    var body = {
        0: Responses.OK,
        1: player.seatid,
    };
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.Send_do_ready, body, null);

    this.check_game_start();
}

five_chess_room.prototype.check_game_start = function () {
    var ready_num = 0;
    for (var i = 0; i < GAME_SEAT; i++) {
        if (!this.seats[i] || this.seats[i].state != State.Ready) {
            continue;
        }
        ready_num++;
    }

    if (ready_num >= 2) {
        this.game_start();
    }
}

//开局信息
five_chess_room.prototype.get_round_start_info = function(){
    var wait_client_time = 3000;//给客户端3000ms时间播放动画
    var body = {
        0: this.think_time,
        1: wait_client_time,
        2: this.black_seatid,
    };
    return body;
}

five_chess_room.prototype.game_start = function () {
    //游戏开始  
    log.info(this.room_id + ' room 游戏开始');
    this.state = State.Playing;

    //清理棋盘
    this.reset_chess_disk();

    //通知参与游戏的玩家
    for (var i = 0; i < GAME_SEAT; i++) {
        if (!this.seats[i] || this.seats[i].state != State.Ready) {
            continue;
        }
        this.seats[i].on_round_start(this);//开始一局游戏
    }

    //判断谁先开始  黑棋先开始
    //第一局游戏随机，后面轮着来；玩家更换之后重新开始随机
    if (this.black_rand) {
        this.black_rand = false;
        this.black_seatid = Math.random() * 2;//[0, 2)
        this.black_seatid = Math.floor(this.black_seatid);
    } else {
        this.black_seatid = this.next_seat(this.black_seatid);
    }

    //广播给所有的人 游戏开始了
    var wait_client_time = 3000;//给客户端3000ms时间播放动画
    var body = this.get_round_start_info();
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.Round_start, body, null);

    this.cur_seatid = -1;//游戏已经开始,但是还有等3s,这个时间段内无当前操作的玩家
    //等待3s后轮到当前持黑的玩家
    setTimeout(this.turn_to_player.bind(this), wait_client_time, this.black_seatid);
    //end

    //保存一下当前的开局信息 用于回放
    var seats_data = [];
    for(var i = 0; i < GAME_SEAT; i++){
        if(!this.seats[i] || this.seats[i].state != State.Playing){
            continue;
        }
        var data = this.get_user_arrived(this.seats[i]);
        seats_data.push(data);
    }

    this.round_data = {};
    this.round_data[0] = seats_data;
    this.round_data[1] = [];//保存操作命令
    var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.Round_start, body];
    this.round_data[1].push(action_cmd);
    //end
}

//玩家超时定时器
five_chess_room.prototype.do_player_action_timeout = function(seatid){
    this.action_timer = null;
    // //超时之后直接结算
    // var winner_seatid = GAME_SEAT - seatid - 1;
    // var winner = this.seats[winner_seatid];
    // this.checkout_game(1, winner);

    //超时策略2： 轮到下个玩家
    this.turn_to_next();
}

five_chess_room.prototype.turn_to_player = function (seatid) {
    if(this.action_timer != null){
        clearTimeout(this.action_timer);
        this.action_timer = null;
    }

    if (!this.seats[seatid] || this.seats[seatid].state != State.Playing) {
        log.warn('turn to player seatid = ' + seatid + ' is invalid');
        return;
    }

    //启动一个定时器,定时器触发之后表示超时
    this.action_timer = setTimeout(this.do_player_action_timeout.bind(this), this.think_time * 1000, seatid);
    this.action_timeout_timestamp = utils.timestamp() + this.think_time;

    var player = this.seats[seatid];
    player.turn_to_player(this);

    this.cur_seatid = seatid;
    var body = {
        0: this.think_time,
        1: seatid,
    };

    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.Turn_to_player, body, null);

    //用于回放
    var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.Turn_to_player, body];
    this.round_data[1].push(action_cmd);
    //end
}

five_chess_room.prototype.next_seat = function (cur_seatid) {
    var i = cur_seatid;
    for (i = cur_seatid + 1; i < GAME_SEAT; i++) {
        if (this.seats[i] && this.seats[i].state == State.Playing) {
            return i;
        }
    }

    for (var i = 0; i < cur_seatid; i++) {
        if (this.seats[i] && this.seats[i].state == State.Playing) {
            return i;
        }
    }

    return -1;
}

//获得下一个玩家
five_chess_room.prototype.get_next_seat = function () {
    //从当前seatid开始,往后遍历
    for (var i = this.cur_seatid + 1; i < GAME_SEAT; i++) {
        if (!this.seats[i] || this.seats[i].state != State.Playing) {
            continue;
        }
        return i;
    }

    for (var i = 0; i < this.cur_seatid; i++) {
        if (!this.seats[i] || this.seats[i].state != State.Playing) {
            continue;
        }
        return i;
    }

    return -1;
}

//检查游戏是否结束
five_chess_room.prototype.check_game_over = function(chess_type) {
	// 横向检查
	for(var i = 0; i < 15; i ++) {
		for(var j = 0; j <= (15 - 5); j ++) {
			if (this.chess_disk[i * 15 + j + 0] == chess_type && 
				this.chess_disk[i * 15 + j + 1] == chess_type && 
				this.chess_disk[i * 15 + j + 2] == chess_type && 
				this.chess_disk[i * 15 + j + 3] == chess_type && 
				this.chess_disk[i * 15 + j + 4] == chess_type) {
                    return 1;
			}
		}
	}
	// end 	

	// 竖向检查
	for(var i = 0; i < 15; i ++) {
		for(var j = 0; j <= (15 - 5); j ++) {
			if (this.chess_disk[(j + 0) * 15 + i] == chess_type && 
				this.chess_disk[(j + 1) * 15 + i] == chess_type && 
				this.chess_disk[(j + 2) * 15 + i] == chess_type && 
				this.chess_disk[(j + 3) * 15 + i] == chess_type && 
				this.chess_disk[(j + 4) * 15 + i] == chess_type) {
				    return 1;
			}
		}
	}
	// end

	// 右上角
	var line_total = 15;
	for(var i = 0; i <= (15 - 5); i ++) {
		for(var j = 0; j < (line_total - 4); j ++) {
			if (this.chess_disk[(i + j + 0) * 15 + j + 0] == chess_type && 
				this.chess_disk[(i + j + 1) * 15 + j + 1] == chess_type && 
				this.chess_disk[(i + j + 2) * 15 + j + 2] == chess_type && 
				this.chess_disk[(i + j + 3) * 15 + j + 3] == chess_type && 
				this.chess_disk[(i + j + 4) * 15 + j + 4] == chess_type) {
                    return 1;
			}
		}
		line_total --;
	}

	line_total = 15 - 1;
	for(var i = 1; i <= (15 - 5); i ++) {
		for(var j = 0; j < (line_total - 4); j ++) {
			if (this.chess_disk[(j + 0) * 15 + i + j + 0] == chess_type && 
				this.chess_disk[(j + 1) * 15 + i + j + 1] == chess_type && 
				this.chess_disk[(j + 2) * 15 + i + j + 2] == chess_type && 
				this.chess_disk[(j + 3) * 15 + i + j + 3] == chess_type && 
				this.chess_disk[(j + 4) * 15 + i + j + 4] == chess_type) {
                    return 1;
			}
		}
		line_total --;
	}
	// end  

	// 左下角
	line_total = 15;
	for(var i = 14; i >= 4; i --) {
		for(var j = 0; j < (line_total - 4); j ++) {
			if (this.chess_disk[(i - j - 0) * 15 + j + 0] == chess_type && 
				this.chess_disk[(i - j - 1) * 15 + j + 1] == chess_type && 
				this.chess_disk[(i - j - 2) * 15 + j + 2] == chess_type && 
				this.chess_disk[(i - j - 3) * 15 + j + 3] == chess_type && 
				this.chess_disk[(i - j - 4) * 15 + j + 4] == chess_type) {
                    return 1;
			}
		}
		line_total --;
	}

	line_total = 1;
	var offset = 0;
	for(var i = 1; i <= (15 - 5); i ++) {
		offset = 0;
		for(var j = 14; j >= (line_total + 4); j --) {
			if (this.chess_disk[(j - 0) * 15 + i + offset + 0] == chess_type && 
				this.chess_disk[(j - 1) * 15 + i + offset + 1] == chess_type && 
				this.chess_disk[(j - 2) * 15 + i + offset + 2] == chess_type && 
				this.chess_disk[(j - 3) * 15 + i + offset + 3] == chess_type && 
				this.chess_disk[(j - 4) * 15 + i + offset + 4] == chess_type) {
                    return 1;
			}
			offset ++;
		}
		line_total ++;
	}
	// end 

	// 检查棋盘是否全部满了，如果没有满，表示游戏可以继续
	for(var i = 0; i < DISK_SIZE * DISK_SIZE; i ++) {
		if (this.chess_disk[i] == ChessType.None) {
			return 0;
		}
	}
	// end 

	return 2; // 返回平局
}

//游戏结算
five_chess_room.prototype.checkout_game = function(ret, winner){
    if(this.action_timer != null){
        clearTimeout(this.action_timer);
        this.action_timer = null;
    }

    this.state = State.CheckOut;//更新房间状态为结算状态

    //遍历所有的在游戏的玩家,结算  加减金币
    for(var i = 0; i < GAME_SEAT; i++){
        if(this.seats[i] == null || this.seats[i].state != State.Playing){
            continue;
        }
        this.seats[i].checkout_game(this, ret, this.seats[i] == winner);
    }

    var winner_score = this.bet_chip;
    var winner_seat = winner.seatid;
    if(ret == 2){
        winner_seat = -1;
    }
    //广播给所有的玩家 游戏结算
    var body = {
        0: winner_seat,//-1 表示平局,其他的表示赢家的座位号
        1: winner_score,
        //...其他自己需要的数据
    };
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.CheckOut, body, null);

    //用于回放
    var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.CheckOut, body];
    this.round_data[1].push(action_cmd);

    this.prev_round_data = this.round_data;//上局回放对象
    this.round_data = {};
    //end

    //踢掉不满足要求的玩家
    for(var i = 0; i < GAME_SEAT; i++){
        if(!this.seats[i]){
            continue;
        }

        // //玩家金币数不足
        // if(this.seats[i].uchip < this.min_chip){
        //     five_chess_model.kick_user_chip_notenough(this.seats[i].uid);
        //     continue;
        // }

        //踢掉断线的玩家 游戏结束立马踢掉
        if(this.seats[i].session == null){
            five_chess_model.kick_offline_player(this.seats[i].uid);
            continue;
        }

        //其他踢人规则  比如超时次数很多  发送玩家离开
    }
    //end

    var check_time = 4000;//结算时间4000ms
    setTimeout(this.on_checkout_over.bind(this), check_time);
}

//结算结束
five_chess_room.prototype.on_checkout_over = function(){
    //更新房间和玩家状态
    this.state = State.Ready;

    for(var i = 0; i < GAME_SEAT; i++){
        if(!this.seats[i] || this.seats[i].state != State.CheckOut){
            continue;
        }

        //通知这些玩家，游戏结算完成
        this.seats[i].on_checkout_over(this);
    }

    //广播给所有的人 结算结束
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.CheckOut_over, null, null);

    //踢掉不满足要求的玩家
    for(var i = 0; i < GAME_SEAT; i++){
        if(!this.seats[i]){
            continue;
        }

        //玩家金币数不足
        if(this.seats[i].uchip < this.min_chip){
            five_chess_model.kick_user_chip_notenough(this.seats[i].uid);
            continue;
        }

        //其他踢人规则  比如超时次数很多  发送玩家离开

    }

}

five_chess_room.prototype.do_player_put_chess = function (player, block_x, block_y, ret_func) {
    //玩家是否已经在房间坐下
    if (player != this.seats[player.seatid]) {
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    //当前房间或玩家不是游戏状态
    if (this.state != State.Playing || player.state != State.Playing) {
        write_err(Responses.Invalid_opt, ret_func)
        return;
    }

    if (player.seatid != this.cur_seatid) {//不是当前玩家在操作
        write_err(Responses.Not_your_turn, ret_func)
        return;
    }

    //块参数的合法性
    if (block_x < 0 || block_x > 14 || block_y < 0 || block_y > 14) {
        write_err(Responses.Invalid_params, ret_func)
        return;
    }

    var index = block_y * 15 + block_x;
    if (this.chess_disk[index] != ChessType.None) {
        write_err(Responses.Invalid_opt, ret_func)
        return;//这个位置已经有棋了
    }

    //玩家操作成功  取消超时定时器
    if(this.action_timer != null){
        clearTimeout(this.action_timer);
        this.action_timer = null;
    }

    if (player.seatid == this.black_seatid) {//黑棋操作
        this.chess_disk[index] = ChessType.Black;
    } else {//白棋操作
        this.chess_disk[index] = ChessType.White;
    }

    //广播给所有的人
    var body = {
        0: Responses.OK,
        1: block_x,
        2: block_y,
        3: this.chess_disk[index],
    };
    this.room_boradcast(Stype.Game5Chess, Cmd.Game5Chess.Put_chess, body, null);
    //用于回放
    var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.Put_chess, body];
    this.round_data[1].push(action_cmd);
    //end

    //检查游戏是否结束  下黑棋就看黑棋是否赢了,下白棋就看白棋是否赢了,如果下满了,平局
    //还可以继续,进轮到下一个玩家
    var check_ret = this.check_game_over(this.chess_disk[index]);
    if (check_ret != 0) {// 1 win, 2 平局
        log.info('游戏结束, ' + this.chess_disk[index] + 'result ' + check_ret);
        this.checkout_game(check_ret, player);
        return;
    }
    //end

    this.turn_to_next();
    //end
}

//轮到下个玩家
five_chess_room.prototype.turn_to_next = function(){
   //把控制权交给另一个玩家
   var next_seat = this.get_next_seat();
   if (next_seat == -1) {
       log.error('cannot find next_seat !!!');
       return;
   }

   this.turn_to_player(next_seat);
}

//断线重连 把当前房间的游戏进度数据传给客户端,让他回到当前进度
five_chess_room.prototype.do_reconnect = function(player){
    if(this.state != State.Playing
        && player.state != State.Playing){
        return;
    }

    //其他玩家的座位数据
    var seat_data = [];
    for(var i = 0; i < GAME_SEAT; i++){
        if(!this.seats[i] || this.seats[i] == player || this.seats[i].state != State.Playing){
            continue;
        }
        var arrived_data = this.get_user_arrived(this.seats[i]);
        seat_data.push(arrived_data);
    }
    //end

    //获取开局信息
    var round_start_info = this.get_round_start_info();
    //end

    //游戏数据
    //end

    //当前游戏进度的游戏信息
    var game_ctrl = [
        this.cur_seatid,
        this.action_timeout_timestamp - utils.timestamp(),//剩余的思考时间
    ];    
    //end

    //传玩家自己的数据
    var body = {
        0: player.seatid,//玩家自己的数据,用于sitdown 玩家坐下
        1: seat_data,//其他玩家的座位数据
        2: round_start_info,//开局信息
        3: this.chess_disk,//棋盘信息
        4: game_ctrl,//游戏当前的进度信息
    };
    //end
    player.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.Reconnect, body);
}

five_chess_room.prototype.do_player_get_prev_round_data = function(player, ret_func){
    if(!this.prev_round_data || player.state == State.Playing || player.state == State.Ready){
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    var body = {
        0: Responses.OK,
        1: this.prev_round_data,
    };
    ret_func(body);
}

module.exports = five_chess_room;

