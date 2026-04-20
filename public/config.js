window.SITE_CONFIG = {
    baseurl: [
        ['OO测试', 'http://192.168.85.128:8000/api/v1'], 
        ['XX测试', 'http://192.168.187.130:8000/api/v1'], 
        ['ZZ测试', 'https://192.168.187.130:9000/api/v1'], 
        ['AA测试', '/api/v1'],                               // 使用nginx代理，前后端使用同一个端口时
    ],
    platformname: '简单命令分发系统',
};