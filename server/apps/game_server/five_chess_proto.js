/**
 * date: 2019-02-25
 */

 /**
  * 发送道具  广播给所有玩家
  * stype, ctype, body: {
  *     0: 道具号
  *     1: 要发送的座位
  * }
  * 返回: stype, ctype, body: {
  *     0: stauts,
  *     1: from_seatid,
  *     2: to_seatid,
  *     3: propid
  * }
  * 
  * 玩家准备  广播给所有玩家
  * stype, ctype
  * 返回: stype, ctype, body: {
  *     0: status,
  *     1: sv_seatid
  * }
  * 
  * 游戏开始  广播给所有玩家
  * 服务器主动通知:
  * stype, ctype, body: {
  *     0: 玩家的思考时间
  *     1: 多少秒后正式开始,留给客户端播放动画
  *     2: 持黑的玩家先开始下
  *     ...
  * }
  * 
  * 轮到玩家  服务器主动通知
  * stype, ctype, body : {
  *     0: 思考时间//本次操作的思考时间
  *     1: 座位号//轮到哪个玩家
  *     ...  //用户当前可以进行的操作
  * }
  * 
  * 玩家下棋
  * stype, ctype, body: {
  *     0: x,
  *     1: y,
  * }
  * 
  * 返回: stype, ctype, body: {
  *     0: status,
  *     1: x,
  *     2: y,
  *     3: seatid,
  * }
  * 
  * 游戏结算 服务器主动发送
  * stype, ctype, body: {
  *     0: winner_id,//平局为-1
  *     1: winner_score,
  * }
  *  
  * 断线重连协议：
  * stype, ctype, body: {
  *     0: seatId, //sitdown
  *     1: 其他玩家的座位数据
  *     2: 游戏开始时候的数据
  *     3: 棋盘数据,
  *     4： 当前游戏进度的游戏数据 ..当前下棋玩家，剩余思考时间
  * }
  * 
  */