/**
 * date: 2019-02-11
 * author: elviscui
 */
// 返回当前的时间戳，单位是秒
function timestamp() {
    var date = new Date();
    var time = Date.parse(date); // 1970到现在过去的毫秒数
    time = time / 1000;
    return time;
}

// 时间戳是秒，Date是毫秒
function timestamp2date(time) {
    var date = new Date();
    date.setTime(time * 1000); // 

    return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
}

// "2017-06-28 18:00:00"
function date2timestamp(strtime)  {
    var date = new Date(strtime.replace(/-/g, '/'));
    var time = Date.parse(date);
    return (time / 1000);
}

// 今天00:00:00的时间戳
function timestamp_today() {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    var time = Date.parse(date); // 1970到现在过去的毫秒数
    time = time / 1000;
    return time;
}

function timestamp_yesterday() {
    var time = timestamp_today();
    return (time - 24 * 60 * 60)
}

var utils = {
    
    /**
     * 随机生成字符串
     * @param {*} len 
     */
    random_string: function(len){
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; 
        
        var maxPos = $chars.length;
    　　var str = '';
    　　for (var i = 0; i < len; i++) {
    　　　　str += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return str;
    },
    
    /**
     * 随机生成int类型的随机数
     * @param {*} len 
     */
    random_int_str: function(len) {
        var $chars = '0123456789'; 
        
        var maxPos = $chars.length;
    　　var str = '';
    　　for (var i = 0; i < len; i++) {
    　　　　str += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return str;
    },
    
    // 随机的生成[begin, end] 范围内的数据
    random_int: function(begin, end) {
        var num = begin + Math.random() * (end - begin + 1);
        num = Math.floor(num);
        if (num > end) {
            num = end;
        }
        return num;
    },
    
    timestamp: timestamp,
    date2timestamp: date2timestamp,
    timestamp2date: timestamp2date,
    timestamp_yesterday: timestamp_yesterday,
    timestamp_today: timestamp_today,
    
};

module.exports = utils
