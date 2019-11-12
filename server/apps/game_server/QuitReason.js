/**
 * date: 2019-02-27
 */

//玩家退出的原因
var QuitReason = {
    UserQuit: 0,//主动离开
    UserLostConnect: 1,//用户掉线
    VipKick: 2,//vip踢人
    SystemKick: 3,//系统踢人
    Chip_is_notenough: 4,//金币不足踢人
};

module.exports = QuitReason;