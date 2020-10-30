# solve-frontend Dockfile
# Version 1.0

# Base images 
FROM node:10.13
LABEL maintainer="wdg(https://github.com/zouzhicun)"

ENV BACKEND_HOST=127.0.0.1
ENV BACKEND_PORT=8000
#ENV LC_ALL=en_US.UTF-8

RUN mkdir -p /data/solve-frontend
#ADD  ./.npmrc    ~
ADD  ./  /data/solve-frontend/

#EXPOSE 8080:8080

WORKDIR /data/solve-frontend

RUN chmod 755 docker-entrypoint.sh
RUN cp docker-entrypoint.sh /usr/local/bin/

RUN npm set registry https://registry.npm.taobao.org/
RUN npm install -g webpack
RUN npm install -g webpack-cli
RUN npm install -g vue-cli
RUN npm install

#ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["docker-entrypoint.sh"]