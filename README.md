# solve front end

> solve front end


#version
v7.9.0
v10.13.0


#config listen host:port
vim config/index.js

## Build Setup


``` bash
# install dependencies
npm install                   #some err may happen, just solve them

# serve with hot reload       #config file is config/index.js 
npm run dev

# 后台运行
nohup npm run dev &

# 由npm的路径指定node的路径
nohup /path_to_npm/npm run dev --scripts-prepend-node-path &

# build for production with minification
# 生产静态文件 可以直接挂nginx使用 但不能直接用浏览器直接打开
npm run build


npm test
```

