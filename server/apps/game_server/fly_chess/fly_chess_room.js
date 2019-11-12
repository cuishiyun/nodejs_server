/**
 * 房间
 * date: 2019-03-04
 * 
 * this.seats = [];//保存座位上的玩家
 * 
 * 如果是2个玩家， 座位号 0-- 红色， 1-- 蓝色
 * 如果是4个玩家,  座位号 0 -- 红色  1 --- 黄色  2 -- 蓝色  3-- 绿色
 * 
 */

var log = require('../../../utils/log.js');
var Stype = require('../../../apps/Stype.js');
var Cmd = require('../../../apps/Cmd.js');
var Responses = require('../../../apps/Responses.js');
var utils = require('../../../utils/utils.js');
var proto_man = require('../../../netbus/proto_man.js');
var fly_chess_state = require('./fly_chess_state.js');
var QuitReason = require('../../../apps/game_server/QuitReason.js');
var fly_chess_room_type = require('./fly_chess_room_type');

var fly_chess_model = require('./fly_chess_model.js');

function write_err(status, ret_func) {
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

//构造函数
function fly_chess_room(room_id, room_type, zone_config) {

    if (room_type == fly_chess_room_type.type_22) {
        this.seat_num_max = 2;//玩家数量
        this.chess_num_max = 2;//棋子数量
    } else if (room_type == fly_chess_room_type.type_24) {
        this.seat_num_max = 2;//玩家数量
        this.chess_num_max = 4;//棋子数量
    } else if (room_type == fly_chess_room_type.type_42) {
        this.seat_num_max = 4;//玩家数量
        this.chess_num_max = 2;//棋子数量
    } else if (room_type == fly_chess_room_type.type_44) {
        this.seat_num_max = 4;//玩家数量
        this.chess_num_max = 4;//棋子数量
    }

    this.zid = zone_config.zid;//桌子当前所属的区间
    this.room_type = room_type;//房间类型
    this.room_id = room_id;//房间号
    this.think_time = zone_config.think_time;//思考时间
    this.min_chip = zone_config.min_chip;//最小金币 玩家有可能一直玩游戏,金币输没了
    this.bet_chip = zone_config.one_round_chip;

    this.state = fly_chess_state.Ready;//房间状态

    //game相关
    // this.black_rand = true;//随机生成黑色的玩家
    // this.black_seatid = -1;//黑色玩家的座位id
    this.cur_seatid = -1;//当前轮到的玩家

    //超时的定时器对象
    this.action_timer = null;//需要开启和取消
    this.action_timeout_timestamp = 0;//玩家超时的时间戳
    //end

    this.seats = [];//保存座位上的玩家 seatid --> player的映射关系
    for (var i = 0; i < this.seat_num_max; i++) {
        this.seats.push(null);
    }

}

//获取玩家到达需要的数据
fly_chess_room.prototype.get_user_arrived = function (other) {
    var body = {
        seatid: other.seatid,
        //玩家信息
        unick: other.unick,
        usex: other.usex,
        uface: other.uface,
        //游戏信息
        uchip: other.uchip,
        uexp: other.uexp,
        uvip: other.uvip,

        state: other.state,
    };
    return body;
}

//玩家进入房间
fly_chess_room.prototype.do_enter_room = function (player) {
    player.enter_room(this);

    //广播给所有人,有玩家进来了  如果觉得有必要,可以进行广播
    // this.room_boradcast(Stype.GameFlyChess, 1000, {0: 'hello, wangmingdi'}, null);

    //把已经存在的玩家发送给刚进来的玩家
    for (var i = 0; i < this.seat_num_max; i++) {
        var other = this.seats[i];
        if (other == null) {
            continue;
        }

        //把玩家坐下的消息广播给房间里面的所有玩家(不包括自己)
        var body = this.get_user_arrived(other);
        player.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.User_arrived, body);
    }
    //end

    log.info('player uid = ' + player.uid + ' enter zone = ' + this.zid + ' room_id = ' + this.room_id);
    //服务器告诉客户端,用户进入了桌子
    var body = {
        status: Responses.OK,
        zid: this.zid,
        room_id: this.room_id,
        room_type: this.room_type,
        //... 其他的房间信息
    };
    player.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Enter_room, body);

    //自动分配一个座位给玩家
    this.do_sitdown(player);
}

//玩家坐下
fly_chess_room.prototype.do_sitdown = function (player) {
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
        status: Responses.OK,
        seatid: sv_seat,
    };
    player.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Sitdown, body);

    //把玩家坐下的消息广播给房间里面的所有玩家(不包括自己)
    var body = this.get_user_arrived(player);
    this.room_boradcast(Stype.GameFlyChess, Cmd.GameFlyChess.User_arrived, body, player.uid);
    //end
}

//玩家离开房间
fly_chess_room.prototype.do_exit_room = function (player, quit_reason) {
    ////不能退出,走断线重连
    if (quit_reason == QuitReason.UserLostConnect
        && this.state == fly_chess_state.Playing
        && player.state == fly_chess_state.Playing) {
        return false;
    }
    //end

    var winner = null;
    //... 判断玩家是否正在游戏 等等
    //end
    if (player.seatid != -1) {
        if (player.state == fly_chess_state.Playing) {
            //当前正在游戏,用户强制退出了  逃跑,算对家赢了
            //elviscui todo
            // var winner_seatid = this.seat_num_max - player.seatid - 1;
            // winner = this.seats[winner_seatid];
        }

        var seatid = player.seatid;
        log.info('player ' + player.uid + ' leave seat ' + player.seatid);

        // if(winner){//结算
        //     this.checkout_game(1, winner);
        // }

        //广播给本房间中所有的玩家(包括自己) -- 玩家站起   坐下->旁观
        var body = {
            status: Responses.OK,
            seatid: seatid,
        };
        this.room_boradcast(Stype.GameFlyChess, Cmd.GameFlyChess.Standup, body, null);
        //end

        //服务器清空玩家座位信息
        player.standup(this);
        this.seats[player.seatid] = null;
        player.seatid = -1;
    }

    player.exit_room(this);

    //广播给所有的玩家  --- 玩家离开房间
    //end

    log.info('player uid = ' + player.uid + ' leave zone ' + this.zid + ' room_id = ' + this.room_id);

    return true;
}

//玩家准备
fly_chess_room.prototype.do_player_ready = function (player, ret_func) {
    //当前房间是否为准备好了
    if (this.state != fly_chess_state.Ready || player.state != fly_chess_state.Idle) {
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
        status: Responses.OK,
        seatid: player.seatid,
    };
    this.room_boradcast(Stype.GameFlyChess, Cmd.GameFlyChess.Send_do_ready, body, null);

    this.check_game_start();
}

fly_chess_room.prototype.check_game_start = function () {
    var ready_num = 0;
    for (var i = 0; i < this.seat_num_max; i++) {
        if (!this.seats[i] || this.seats[i].state != fly_chess_state.Ready) {
            continue;
        }
        ready_num++;
    }

    if (ready_num >= this.seat_num_max) {
        this.game_start();
    }
}

fly_chess_room.prototype.reset_chess_disk = function () {

}

//开局信息
fly_chess_room.prototype.get_round_start_info = function () {
    var wait_client_time = 3000;//给客户端3000ms时间播放动画
    var body = {
        think_time: this.think_time,
        wait_client_time: wait_client_time,
    };
    return body;
}

fly_chess_room.prototype.game_start = function () {
    //游戏开始  
    log.info(this.room_id + ' room 游戏开始');
    this.state = fly_chess_state.Playing;

    //清理棋盘
    this.reset_chess_disk();

    //通知参与游戏的玩家
    for (var i = 0; i < this.seat_num_max; i++) {
        if (!this.seats[i] || this.seats[i].state != fly_chess_state.Ready) {
            continue;
        }
        this.seats[i].on_round_start(this);//开始一局游戏
    }

    //判断谁先开始  红色先开始

    //广播给所有的人 游戏开始了
    var wait_client_time = 3000;//给客户端3000ms时间播放动画
    var body = this.get_round_start_info();
    this.room_boradcast(Stype.GameFlyChess, Cmd.GameFlyChess.Round_start, body, null);

    this.cur_seatid = -1;//游戏已经开始,但是还有等3s,这个时间段内无当前操作的玩家
    //等待3s后轮到当前持黑的玩家
    setTimeout(this.turn_to_player.bind(this), wait_client_time, 0);
    //end
}

//玩家超时定时器
fly_chess_room.prototype.do_player_action_timeout = function (seatid) {
    this.action_timer = null;
    // //超时之后直接结算
    // var winner_seatid = GAME_SEAT - seatid - 1;
    // var winner = this.seats[winner_seatid];
    // this.checkout_game(1, winner);

    //随机给这个玩家一个点数


    //超时策略2： 轮到下个玩家
    //this.turn_to_next();

    //超时策略3： 随机摇一个筛子  相当于托管 
    this.do_roll_shaizi(seatid, -1);

}

fly_chess_room.prototype.get_next_seat = function () {
    //从当前seatid开始,往后遍历
    for (var i = this.cur_seatid + 1; i < this.seat_num_max; i++) {
        if (!this.seats[i] || this.seats[i].state != fly_chess_state.Playing) {
            continue;
        }
        return i;
    }

    for (var i = 0; i < this.cur_seatid; i++) {
        if (!this.seats[i] || this.seats[i].state != fly_chess_state.Playing) {
            continue;
        }
        return i;
    }

    return -1;
}

//轮到下个玩家
fly_chess_room.prototype.turn_to_next = function () {
    //把控制权交给另一个玩家
    var next_seat = this.get_next_seat();
    if (next_seat == -1) {
        log.error('cannot find next_seat !!!');
        return;
    }

    this.turn_to_player(next_seat);
}

fly_chess_room.prototype.turn_to_player = function (seatid) {
    if (this.action_timer != null) {
        clearTimeout(this.action_timer);
        this.action_timer = null;
    }

    if (!this.seats[seatid] || this.seats[seatid].state != fly_chess_state.Playing) {
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
        think_time: this.think_time,
        seatid: seatid,
    };

    this.room_boradcast(Stype.GameFlyChess, Cmd.GameFlyChess.Turn_to_player, body, null);
}

//获取房间有几个空的座位
fly_chess_room.prototype.empty_seat = function () {
    var num = 0;
    for (var i in this.seats) {
        if (this.seats[i] == null) {
            num++;
        }
    }
    return num;
}

//找一个空位
fly_chess_room.prototype.search_empty_seat = function () {
    for (var i = 0; i < this.seat_num_max; i++) {
        if (this.seats[i] == null) {
            return i;
        }
    }
    return -1;
}

//基于旁观列表来广播
fly_chess_room.prototype.room_boradcast = function (stype, ctype, body, not_to_uid) {
    var json_uid = [];
    var buf_uid = [];

    var cmd_json = null;
    var cmd_buf = null;

    var gw_session = null;//默认只有一个网关

    for (var i = 0; i < this.seats.length; i++) {
        if (this.seats[i] == null
            || this.seats[i].session == null
            || this.seats[i].uid == not_to_uid) {
            continue;
        }

        gw_session = this.seats[i].session;
        if (this.seats[i].proto_type == proto_man.PROTO_JSON) {
            json_uid.push(this.seats[i].uid);
            if (!cmd_json) {
                cmd_json = proto_man.encode_cmd(0, proto_man.PROTO_JSON, stype, ctype, body);
            }
        } else if (this.seats[i].proto_type == proto_man.PROTO_BUF) {
            buf_uid.push(this.seats[i].uid);
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

//断线重连 把当前房间的游戏进度数据传给客户端,让他回到当前进度
fly_chess_room.prototype.do_reconnect = function (player) {
    log.warn('玩家断线重连' + player.zid);
    // if(this.state != State.Playing
    //     && player.state != State.Playing){
    //     return;
    // }

    // //其他玩家的座位数据
    // var seat_data = [];
    // for(var i = 0; i < this.seat_num_max; i++){
    //     if(!this.seats[i] || this.seats[i] == player || this.seats[i].state != State.Playing){
    //         continue;
    //     }
    //     var arrived_data = this.get_user_arrived(this.seats[i]);
    //     seat_data.push(arrived_data);
    // }
    // //end

    // //获取开局信息
    // var round_start_info = this.get_round_start_info();
    // //end

    // //游戏数据
    // //end

    // //当前游戏进度的游戏信息
    // var game_ctrl = [
    //     this.cur_seatid,
    //     this.action_timeout_timestamp - utils.timestamp(),//剩余的思考时间
    // ];    
    // //end

    // //传玩家自己的数据
    // var body = {
    //     0: player.seatid,//玩家自己的数据,用于sitdown 玩家坐下
    //     1: seat_data,//其他玩家的座位数据
    //     2: round_start_info,//开局信息
    //     3: this.chess_disk,//棋盘信息
    //     4: game_ctrl,//游戏当前的进度信息
    // };
    // //end
    // player.send_cmd(Stype.GameFlyChess, Cmd.GameFlyChess.Reconnect, body);
}

fly_chess_room.prototype.do_roll_shaizi = function(seatid, wantNum = -1){
    if(wantNum < 1 || wantNum > 6){
        wantNum = -1;
    }

    if(wantNum == -1){
        wantNum = Math.random() * 6 + 1;//[1, 7)
        wantNum = Math.floor(wantNum);
    }

    //更改服务器上的游戏数据 由服务器决定该玩家的哪个棋子进行移动
    

    var body = {
        state: Responses.OK,
        seatid: seatid,
        num: wantNum,
    };
    this.room_boradcast(Stype.GameFlyChess, Cmd.GameFlyChess.Roll_shaizi, body, null);

    //玩家操作成功  取消超时定时器
    if(this.action_timer != null){
        clearTimeout(this.action_timer);
        this.action_timer = null;
    }

    //检查游戏是否结束

    //游戏未结束,轮到下个玩家
    this.turn_to_next();
}

fly_chess_room.prototype.roll_shaizi = function (player, wantNum, ret_func) {
    //当前房间是否为准备好了
    if (this.state != fly_chess_state.Playing || player.state != fly_chess_state.Playing) {
        write_err(Responses.Invalid_opt, ret_func)
        return;
    }

    //玩家是否已经在该房间坐下
    if (player != this.seats[player.seatid]) {
        write_err(Responses.Invalid_opt, ret_func);
        return;
    }

    if (player.seatid != this.cur_seatid) {//不是当前玩家在操作
        write_err(Responses.Not_your_turn, ret_func)
        return;
    }

    this.do_roll_shaizi(player.seatid, wantNum);
}

module.exports = fly_chess_room;

