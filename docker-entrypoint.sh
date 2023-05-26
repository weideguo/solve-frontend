#!/bin/sh
#
# export BACKEND_HOST=127.0.0.1
# export BACKEND_PORT=8000
#
cd /data/solve-frontend
BACKEND_NAME=${BACKEND_NAME:-test}
sed -i "s|config.baseurl.*|config.baseurl = [['${BACKEND_NAME}', 'http://${BACKEND_HOST}:${BACKEND_PORT}/api/v1']]|g" src/config/config.js
npm run start
