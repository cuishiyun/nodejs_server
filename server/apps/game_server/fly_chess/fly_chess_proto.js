/**
 * date: 2019-03-01
 * 飞行棋协议
 * 
 *  游戏规则,由持红的玩家开始先动
 */

 /**
  * 进入区间协议: Enter_zone
  * 客户端发送: stype, ctype, body: {
  *     zid: 1,//区间id      1: 2人场, 2个棋子, 2: 2人场，4个棋子, 3 : 4人场，2个棋子, 4 : 4人场，4个棋子
  * }
  * 服务器返回: stype, ctype, body: {
  *     status: Responses.OK,
  *     zid: 1,
  *     room1_playerNum: 房间里的人数
  *     room2_playerNum: 房间里的人数
  *     room3_playerNum: 房间里的人数
  *     room4_playerNum: 房间里的人数
  * }
  * 
  * 退出区间协议: Exit_zone
  * 客户端发送 stype, ctype, zid
  * 服务器返回 stype, ctype, body: {
  *     status: Responses.OK,
  *     zid: 1,
  * }
  * 
  *    
  * 进入游戏房间 Enter_room
  * 客户端发送: stype, ctype, room_type
  * 服务器返回 stype, ctype, body: {
  *     status: Responses.OK,
  *     zid: zid,
  *     room_id: room_id,
  *     room_type: 房间类型
  * }
  * 
  * 退出游戏房间 Exit_room
  * 客户端发送: stype, ctype, room_type
  * 服务器返回 stype, ctype, body: {
  *     status: Responses.OK,
  *     room_type: 房间类型
  * }
  * 
  * 玩家坐下 服务器主动通知
  * stype, ctype, body: {
  *     status: Responses.OK,
  *     seatid: 座位号,
  *     color: 1,2,3,4  红,黄,蓝,绿
  * }
  * 
  * 玩家站起 服务器主动通知
  * stype, ctype, body: {
  *     status: Responses.OK,
  *     seatid: 座位号
  * }
  * 
  * 玩家到达 服务器主动通知
  * stype, ctype, body = {
   *     seatid: other.seatid,
   *     //玩家信息
    *    unick: other.unick,
        usex: other.usex,
        uface: other.uface,
        //游戏信息
        uchip: other.uchip,
        uexp: other.uexp,
        uvip: other.uvip,

        state: other.state,
    }
  * 
  * 
  * 玩家准备 Send_do_ready
  * stype, ctype, null
  * 服务器返回:
  * stype, ctype, body: {
  *     status: Responses.OK,
  *     seatid: 座位号
  * }
  * 
  * 游戏开始 服务器主动推送 Round_start
  * stype, ctype, body: {
  *     think_time: 玩家的思考时间,
  *     wait_client_time: 等待客户端的时间
  * }
  * 
  * 轮到玩家  服务器主动推送  turn_to_player
  * stype, ctype, body: {
  *     think_time: 玩家的思考时间
  *     seatid: 轮到的座位号
  * }
  * 
  * 摇色子 
  * 客户端发送 stype, ctype, num(自己想要的点数,-1代表服务器随机)
  * 服务器返回 stype, ctype, body: {
  *     status: Responses.OK,
  *     seatid: 座位号
  *     num: 1,
  * }
  * 
  */
 