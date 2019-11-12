
var websocket = require('websocket');

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;

        // var buf = new ArrayBuffer(10);
        // var dataview = new DataView(buf);//data 只能处理int，不能处理字符串

        // dataview.setUint8(0, 100);//从0自己开始写入100
        // var value = dataview.getUint8(0);//读取出来
        // console.log('value = ' + value);


        // this.scheduleOnce(function(){
        //     var data = {
        //         uname: '汉字 creator',
        //         upwd: 'abcd creator'
        //     };
    
        //     websocket.send_cmd(1, 12, data);

        // }.bind(this), 2.0);

    },

    // called every frame
    update: function (dt) {
        
    },
});
