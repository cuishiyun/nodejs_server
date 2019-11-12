/**
 * 飞行棋玩家对象
 * date: 2019-03-04
 */

var fly_chess_state = require('./fly_chess_state.js');
var log = require('../../../utils/log.js');
var mysql_game = require('../../../database/mysql_game.js');
var redis_game = require('../../../database/redis_game.js');

//构造器
function fly_chess_player(uid){
    this.uid = uid;

    //玩家的游戏数据
    this.uchip = 0;
    this.uvip = 0;
    this.uexp = 0;

    //玩家的账号数据
    this.unick = '';
    this.usex = -1;
    this.uface = 0;

    //玩家的游戏对象
    this.zid = -1;//玩家当前所在的区间
    this.room_id = -1;//玩家当前所在的房间id
    this.seatid = -1;//玩家当前在房间中的座位号

    //给socket发送数据需要
    this.session = null;
    this.proto_type = -1;

    this.state = fly_chess_state.Idle;//玩家默认状态
}

//初始化游戏数据
fly_chess_player.prototype.init_ugame_info = function(ugame_info){
    this.uchip = ugame_info.uchip;
    this.uvip = ugame_info.uvip;
    this.uexp = ugame_info.uexp;
}

//初始化账号数据
fly_chess_player.prototype.init_uinfo = function(uinfo){
    this.unick = uinfo.unick;
    this.usex = uinfo.usex;
    this.uface = uinfo.uface;
}

//初始化socket数据
fly_chess_player.prototype.init_session = function(session, proto_type){
    this.session = session;
    this.proto_type = proto_type;
}

//给网关发送数据
fly_chess_player.prototype.send_cmd = function(stype, ctype, body){
    if(!this.session){
        return;
    }

    this.session.send_cmd(stype, ctype, body, this.uid, this.proto_type);
}

//玩家进入区间
fly_chess_player.prototype.enter_zone = function(zone){
    
}

//玩家离开区间
fly_chess_player.prototype.exit_zone = function(zone){

}

//玩家进入房间
fly_chess_player.prototype.enter_room = function(room){
    this.room_id = room.room_id;
    this.state = fly_chess_state.Idle;
}

//玩家离开房间
fly_chess_player.prototype.exit_room = function(room){
    this.room_id = -1;
    this.state = fly_chess_state.Idle;
}

//坐下
fly_chess_player.prototype.sitdown = function(room){

}

//站起
fly_chess_player.prototype.standup = function(room){
    this.state = fly_chess_state.Idle;
}

//准备
fly_chess_player.prototype.do_ready = function(room){
    this.state = fly_chess_state.Ready;
}

//开始一局游戏
fly_chess_player.prototype.on_round_start = function(room){
    this.state = fly_chess_state.Playing;
}

//轮到玩家下棋  如果要做机器人,那么机器人可以继承 chess_player对象,重置turn_to_player，在这里自己思考来下棋
fly_chess_player.prototype.turn_to_player = function(room){
    //如果玩家挂机，在这里处理
}

//玩家游戏结算
//ret 1 有输赢, 2 平局
fly_chess_player.prototype.checkout_game = function(room, ret, is_winner){
    // this.state = fly_chess_state.CheckOut;
    // if(ret ==  2){//平局
    //     return;
    // }

    // var chip = room.bet_chip;
    // //有输赢, 更新数据库
    // mysql_game.add_ugame_uchip(this.uid, chip, is_winner);

    // //更新redis中的金币
    // redis_game.add_ugame_uchip(this.uid, chip, is_winner);

    // if(is_winner){
    //     this.uchip += chip;//更新服务器内存上保存的玩家金币数
    // }else{
    //     this.uchip -= chip;
    // }
}

//结算结束
fly_chess_player.prototype.on_checkout_over = function(room){
    this.state = fly_chess_state.Idle;
}

module.exports = fly_chess_player;

