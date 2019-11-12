/**
 * 2019-01-28
 * 
 * 所有的命令号都在这里
 * 跨服
 * 
 */

var Cmd = {
    //全局的命令号,当用户掉线，所有的服务都会收到网关转发过了的消息
    User_Disconnect: 10000,
    BroadCast: 10001,//广播服务

    Auth: {
        GUEST_LOGIN: 1,//游客登录
        RELOGIN: 2,//账号在另外的地方登录
        EDIT_PROFILE: 3,//修改用户资料
        GUEST_UPGRADE_IDENTIFY: 4,//游客升级获取验证码
        BIND_PHONE_NUM: 5,//游客绑定手机账户
        UNAME_LOGIN: 6,//账号密码登录

        GET_PHONE_REG_VARIFY: 7,//获取手机注册的验证码
        PHONE_REG_ACCOUNT: 8,//注册账号
        Get_forget_pwd_verify: 9,//忘记密码获取验证码
        Reset_user_pwd: 10,//重置用户密码

    },

    //系统服务器支持的命令
    GameSystem: {
        Get_game_info: 1,//获取游戏信息
        Get_login_bonues: 2,//获取每日登陆奖励
        Recv_login_bonues: 3,//领取每日登陆奖励
        Get_world_rank_info: 4,//获取世界排行榜
    },

    //五子棋服务
    Game5Chess: {
        Enter_zone: 1,//进入游戏区
        User_Quit: 2,//玩家离开五子棋游戏

        Enter_room: 3,//玩家进入房间的桌子
        Exit_room: 4,//玩家离开房间的桌子
        
        Sitdown: 5,//玩家坐下
        Standup: 6,//玩家站起

        User_arrived: 7,//其他玩家抵达  服务器主动通知
        
        Send_prop: 8,//发送道具
        Send_do_ready: 9,//发送准备消息
        Round_start: 10,//游戏开始 ---  服务器主动通知
        Turn_to_player: 11,//轮到玩家  ---  服务器主动通知
        Put_chess: 12,//下棋
        CheckOut: 13,//游戏结算
        CheckOut_over: 14,//游戏结算结束,清理工作
        Reconnect: 15,//玩家断线重连
        Get_prev_round: 16,//获取上局回顾

    },

    //飞行棋服务
    GameFlyChess: {
        Enter_zone: 1,
        Exit_zone: 2,//退出区组
        Enter_room: 3,//进入房间
        Exit_room: 4,//退出房间

        Sitdown: 5,//玩家坐下
        Standup: 6,//玩家站起

        User_arrived: 7,//其他玩家抵达  服务器主动通知

        Send_do_ready: 9,//发送准备消息
        Round_start: 10,//游戏开始 ---  服务器主动通知
        Turn_to_player: 11,//轮到玩家  ---  服务器主动通知
        Roll_shaizi: 12,//摇骰子

    },

};


module.exports = Cmd;
