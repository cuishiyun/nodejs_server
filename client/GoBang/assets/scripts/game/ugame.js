/**
 * date: 2019-01-28
 */
var utils = require('utils');

var ugame = {
    unick: '',
    usex: -1,
    uface: 0,
    uvip: 0,
    guest_key: null,
    is_guest: false,//是否游客账号

    uname: null,
    upwd: null,

    user_game_info: null,//玩家的游戏数据

    zid: 0,//玩家的区间信息

    prev_round_data: null,//上局回放

    guest_login_success: function(unick, usex, uface, uvip, ukey) {
        this.unick = unick;
        this.usex = usex;
        this.uface = uface;
        this.uvip = uvip;
        this.is_guest = true;
        
        if(this.guest_key != ukey){
            this.guest_key = ukey;
            //保存数据到本地
            cc.sys.localStorage.setItem('guest_key', this.guest_key);
        }

    },

    uname_login_success: function(unick, usex, uface, uvip){
        this.unick = unick;
        this.usex = usex;
        this.uface = uface;
        this.uvip = uvip;
        this.is_guest = false;
        
        this._save_uname_and_upwd();
    },

    _save_uname_and_upwd: function(){
        //保存一下本地的用户名 和 密码的密文
        var body = {uname: this.uname, upwd: this.upwd};
        var body_json = JSON.stringify(body);
        cc.sys.localStorage.setItem("uname_upwd", body_json);
    },

    edit_profile_success: function(unick, usex){
        this.unick = unick;
        this.usex = usex;
    },

    save_temp_uname_and_upwd: function(uname, upwd){
        this.uname = uname;
        this.upwd = upwd;
    },

    guest_bind_phone_success: function(){
        this.is_guest = false;
        this._save_uname_and_upwd();
    },

    //{uchip, uexp, uvip}
    save_user_game_data: function(body){
        this.user_game_info = {
            uchip: body.uchip, 
            uvip: body.uvip,
            uexp: body.uexp,
        };
        
        // console.log('!!!!!!!!!!' + JSON.stringify(this.user_game_info));
    },

    enter_zone: function(zid){
        this.zid = zid;
    },

};

//测试
// ugame.save_temp_uname_and_upwd('18515120919', 'd2fc21f650e8314cc99c86bdae415d28');
// ugame.guest_bind_phone_success();

var uname_and_upwd_json = cc.sys.localStorage.getItem('uname_upwd');

ugame.guest_key = cc.sys.localStorage.getItem('guest_key');
if(!ugame.guest_key){
    ugame.guest_key = utils.random_string(32);
}

if(!uname_and_upwd_json){
    ugame.is_guest = true;
}else{
    var body = JSON.parse(uname_and_upwd_json);

    ugame.is_guest = false;
    ugame.uname = body.uname;
    ugame.upwd = body.upwd;
    // console.log(body);
}

module.exports = ugame;
