# solve-frontend Dockfile
# FROM node:24.15.0-alpine3.22
FROM node:24 AS builder

ARG REGISTRY="https://registry.npmjs.org/"
ENV REGISTRY=${REGISTRY}

WORKDIR /app

# 利用 Docker 缓存层，加速构建
COPY package*.json ./


RUN npm set registry ${REGISTRY}
RUN npm install


COPY . .

# 自定义高亮
COPY doc/highlight/prism-bash.js node_modules/prismjs/components/prism-bash.js

RUN npm run build

# FROM nginx:1.29.8-alpine
FROM nginx:alpine


ENV TZ=Asia/Shanghai

COPY doc/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

COPY --from=builder /app/docker-entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/docker-entrypoint.sh


# 启动nginx
CMD ["docker-entrypoint.sh"]
