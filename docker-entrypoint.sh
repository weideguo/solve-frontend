#!/bin/sh
#
# export BACKEND_HOST=127.0.0.1
# export BACKEND_PORT=8000
#
cd /data/solve-frontend
BACKEND_NAME=${BACKEND_NAME:-test}
sed -i "s|baseurl.*|baseurl: [['${BACKEND_NAME}', 'http://${BACKEND_HOST}:${BACKEND_PORT}/api1']]\n,_baseurl:[|g" public/config.js
npm run dev
