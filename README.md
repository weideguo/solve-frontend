# solve-frontend #

solve frontend.

使用jwt保存登陆状态。


running
--------------

### dependency servers ###
> solve-frontend  web前端 可以单独放在一台服务器

* redis           用于存储数据 可以单独放在一台服务器，与solve最好一一对应。(>=2.0.0)
* [solve](https://github.com/zouzhicun/solve)          核心命令分发服务 一个隔离的SSH网络（即SSH能连接的网络）需要一个solve服务
* [solve-backend](https://github.com/zouzhicun/solve-backend)    web后端 由于跟solve有文件关联，需要与solve放在同一台服务器
* nginx           前后端的代理 生产环境应该使用https防止信息传输时泄露

### version support ###
* node v7.9.0
* node v10.13.0
* 其他的版本可能也支持，但缺少测试

### prerun ###
```shell
# 修改监听的ip以及端口
vim config/index.js

# 修改后端的url以及其他配置参数
vim src/config/config.js

# 安装依赖项 
# package.json和package-lock.json指定
# 如果存在错误，则需要手动安装没有正确安装的模块
npm install              
```

### start & build  ###
``` shell
# 运行 可以热加载
npm run dev

# 后台运行
nohup npm run dev &

# 由npm的路径指定node的路径
nohup /path_to_npm/npm run dev --scripts-prepend-node-path &

# 生产静态文件 可以直接挂nginx使用 但不能直接用浏览器直接打开
npm run build

# 测试？
npm test
```


Others
--------------

> 使用vue框架
> 
> UI组件库 [iviewui](https://www.iviewui.com/)

