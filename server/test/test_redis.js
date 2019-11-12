/**
 * test redis
 * date: 2019-02-13
 */
var redis = require('redis');
//创建client连接到redis server
var client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    db: 0,
});

//key ---> value
//set get
client.set('my_redis_class_key', '123456');
client.get('my_redis_class_key', function(err, data){
    if(err){
        return;
    }

    console.log('data = ' + data);
});

//hash  用户表
client.hmset('00015_redis_class_user', {
    uname: 'elviscui',
    upwd: '123456',
    uemail: '316@qq.com',
}, function(err){

});

client.hgetall('00015_redis_class_user', function(err, obj){
    if(err){
        return;
    }
    console.log('hash = ' + JSON.stringify(obj));
});

//array
// client.lpush('0000_1111_7777_data', 'xiaohong');
// client.rpush('0000_1111_7777_data', 'xiaohong1');
// client.rpush('0000_1111_7777_data', 'xiaohong2');
// client.rpush('0000_1111_7777_data', 'xiaohong3');

client.lrange('0000_1111_7777_data', 0, 100, function(err, data){
    if(err){
        console.log('err = ' + err);
        return;
    }
    console.log('zrange = ' + data);
});

//有序集合
// client.zadd('0000_1111_rank', 500, 'blake');
// client.zadd('0000_1111_rank', 400, 'huangdong');
// client.zadd('0000_1111_rank', 300, 'xiaotian');
// client.zadd('0000_1111_rank', 100, 'xiaoming');

//zrevrange
client.zrange('0000_1111_rank', 0, 10, function(err, data){
    if(err){
        return;
    }
    console.log(data);
});


//监听error事件, 自动重新连接服务器
client.on('error', function(err){
    console.log('redis client err = ' + err);
});

client.on('end', function(){
    console.log('服务器断开连接');
});

//连接上服务器
client.on('ready', function(){
    console.log('ready');
});
