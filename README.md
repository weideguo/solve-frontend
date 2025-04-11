# solve-frontend #

solve frontend.

使用jwt保存登陆状态。


running
--------------

### version support ###
* node v16.14.2
* node v18.20.8
* node v20.18.3
* node v22.14.0
* 其他的版本可能也支持，但缺少测试

### prerun ###
```shell
# 修改后端的url以及其他配置参数
vim src/config/config.js

# 安装依赖项 
npm install -g @vue/cli    # 不是必要，仅在使用`vue create solve-frontend`新创建项目时需要 
# package.json和package-lock.json指定
# 如果存在错误，则需要手动安装没有正确安装的模块
npm install              
```

### start & build  ###
``` shell
# 运行，可以热加载
npm run serve -- --host 0.0.0.0 --port 8080

# 后台运行，监听的ip及端口由package.json控制
nohup npm run serve &

# 由npm的路径指定node的路径
nohup /path_to_npm/npm run serve --scripts-prepend-node-path &

# 生产静态文件 可以直接挂nginx使用 但不能直接用浏览器直接打开
npm run build

# 测试？
npm test
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

