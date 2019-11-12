// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

/**
 * date: 2019-03-01
 * 
 * loading界面
 */

var Cmd = require('Cmd');
var websocket = require('websocket');
import ulevel from "../ulevel";
import auth from "../protobufs/auth";
import Stype from "../Stype";
import game_system from "../protobufs/game_system";
import Responses from "../Responses";
import fly_chess from "../protobufs/fly_chess";
var ugame = require('ugame');

const {ccclass, property} = cc._decorator;

@ccclass
export default class loading extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var service_handlers = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        service_handlers[Stype.GameSystem] = this.on_system_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    }

    start () {
        
    }

    // update (dt) {}

    /**
     * 游客登陆
     */
    public on_tourist_login_btn_click(): void{
       auth.guest_login();
    }

    /**
     * 用户名和密码登录
     */
    public on_uname_login_btn_click(): void{
        auth.uname_login('elvis', '123456');
    }

    /**
     * 注册账号
     */
    public on_reg_account_click(): void{
        console.log('注册账号');
    }

    /**
     * 忘记密码
     */
    public on_forget_pwd_click(): void{
        console.log('忘记密码');
    }

    //登录成功之后,登录到游戏服务器上面
    public on_auth_login_success(){
        game_system.get_game_info();
    }

    public on_guest_login_server_return(body){
        if(body.status != Responses.OK){
            return;
        }
        // unick, usex, uface, uvip, ukey
        ugame.guest_login_success(body.unick, body.usex, body.uface, body.uvip, body.ukey);
        
        this.on_auth_login_success();
    }

    public on_uname_login_server_return(body){
        if(body.status != Responses.OK){
            return;
        }
        // unick, usex, uface, uvip 
        ugame.uname_login_success(body.unick, body.usex, body.uface, body.uvip);
        this.on_auth_login_success();
    }

    public on_auth_server_return(stype, ctype, body): void{
        switch(ctype){
            case Cmd.Auth.GUEST_LOGIN:
            {
                console.log('游客登录 ' + JSON.stringify(body));
                this.on_guest_login_server_return(body);
            }
            break;
            case Cmd.Auth.RELOGIN:
            {
                console.log('loading 账号在其他设备已登录');
                // cc.director.loadScene('loading');//返回登录界面
            }
            break; 
            case Cmd.Auth.UNAME_LOGIN:
            {
                console.log('用户名和密码登录 ' + JSON.stringify(body));
                this.on_uname_login_server_return(body);
            }
            break;
        }
    }

    public on_get_game_info_server_return(body){
        var status = body.status;
        if(status != Responses.OK){
            return;
        }        
        //保存数据 {uchip, uexp, uvip}
        ugame.save_user_game_data(body);
        cc.director.loadScene('zone_scene');
    }

    public on_system_server_return(stype, ctype, body): void{
        switch(ctype){
            case Cmd.GameSystem.Get_game_info:
            {
                console.log('登录系统服务器, 获取游戏信息 ' + JSON.stringify(body));
                this.on_get_game_info_server_return(body);
            }
            break;
            default:
            break;
        }
    }

}
