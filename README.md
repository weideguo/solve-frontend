# solve-frontend #

solve frontend.

使用jwt保存登陆状态。


running
--------------

### version support ###
* node v22.14.0
* 其他的版本可能也支持，但缺少测试

### prerun ###
```shell
# 修改后端的url以及其他配置参数
vim src/config/config.js

# 安装依赖项 
# package.json和package-lock.json指定
# 如果存在错误，则需要手动安装没有正确安装的模块
npm install              
```

### start & build  ###
``` shell
# 运行，可以热加载
npm run dev -- --host 0.0.0.0 --port 8080

# 后台运行，监听的ip及端口由package.json控制
nohup npm run dev &

# 生产静态文件 可以直接挂nginx使用 但不能直接用浏览器直接打开
npm run build
```

### multi language  ###
通过设置localStorage的language并重新加载实现语言的转换  
实现的语言在以下目录 src/libs/lang
在 src/main.js 控制语言的引入


Others
--------------

> 使用vue框架
> 
> UI组件库 [iviewui](https://www.iviewui.com/)

