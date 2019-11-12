/**
 * date: 2019-02-25
 */

var State = {
    InView: 1,//玩家旁观  只有玩家有这个属性
    Ready: 2,//准备好了,可以开始
    Playing: 3,//正在游戏
    CheckOut: 4, //结算状态
};

module.exports = State;
