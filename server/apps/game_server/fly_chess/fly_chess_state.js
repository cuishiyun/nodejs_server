/**
 * date: 2019-03-04
 */

var fly_chess_state = {
    Idle: 1,//玩家在大厅休息
    InView: 2,//玩家旁观  只有玩家有这个属性
    Ready: 3,//准备好了,可以开始
    Playing: 4,//正在游戏
    CheckOut: 5, //结算状态
};

module.exports = fly_chess_state;
