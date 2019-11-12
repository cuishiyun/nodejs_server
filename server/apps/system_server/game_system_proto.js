/**
 * 
 * 登录到游戏服务器 Cmd.Game_system.UGAME_LOGIN: 1
 * stype, ctype, null
 * 返回: 
 * stype, ctype, {
 *     0: status,
 *     1: uchip,
 *     2: uexp,
 *     3: game_uvip,
 *     4: ...
 * }
 * 
 * 
 * 获取今天登陆奖励
 * stype, ctype, null
 * 返回: stype, ctype, body: {
 *      0: stauts,
 *      1: 是否有奖励,//0表示今天没有奖励或者已领取, 1表示有奖励
 *      2: id,//领取的id
 *      3: bonues,//
 *      4: days,//连续登陆的天数
 * }
 * 
 */