# solve-frontend #

solve frontend.

使用jwt保存登陆状态。


running
--------------

### version support ###
* node v7.9.0
* node v10.13.0
* node v12.16.1
* 其他的版本可能也支持，但缺少测试

### prerun ###
```shell
# 修改监听的ip以及端口
vim config/index.js
# 直接通过设置环境变量修改监听的ip以及端口
export HOST="0.0.0.0"
export PORT="8080"

# 修改后端的url以及其他配置参数
vim src/config/config.js

# 安装依赖项 
npm install -g webpack
npm install -g webpack-cli
npm install -g vue-cli
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

### multi language  ###
通过设置localStorage的language并重新加载实现语言的转换  
实现的语言在以下目录 libs/lang/


Others
--------------

> 使用vue框架
> 
> UI组件库 [iviewui](https://www.iviewui.com/)

