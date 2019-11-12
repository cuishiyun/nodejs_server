/**
 * date: 2019-01-25
 * 管理所有的服务
 */

var Stype = {
    Broadcast: 10000,//广播服务

    TalkRoom: 1,//聊天服务
    Auth: 2,//登录服务
    
    Game_system: 3,//系统服务  个人和系统,不会存在多个玩家进行交互
    Game5Chess: 4,//五子棋的休闲模式游戏服务

};

module.exports = Stype;

