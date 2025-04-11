# solve-frontend Dockfile
# Version 1.0

# Base images 
FROM node:16.14
LABEL maintainer="wdg(https://github.com/weideguo)"

ARG REGISTRY="https://registry.npmjs.org/"

ENV REGISTRY=${REGISTRY}

ENV BACKEND_HOST=127.0.0.1
ENV BACKEND_PORT=8000
#ENV LC_ALL=en_US.UTF-8

RUN rm /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN mkdir -p /data/solve-frontend
#ADD  ./.npmrc    ~
ADD  ./  /data/solve-frontend/

#EXPOSE 8080:8080

WORKDIR /data/solve-frontend

RUN chmod 755 docker-entrypoint.sh
RUN cp docker-entrypoint.sh /usr/local/bin/

RUN npm set registry ${REGISTRY}
RUN npm install -g @vue/cli
RUN npm install

#ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["docker-entrypoint.sh"]
