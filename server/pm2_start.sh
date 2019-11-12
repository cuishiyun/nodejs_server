#!/bin/sh
pm2 delete all
pm2 start apps/center_server/center_server.js 
pm2 start apps/system_srver/system_server.js 
pm2 start apps/game_server/game_server.js 
pm2 start apps/gateway/gateway.js 
pm2 start apps/webserver/webserver.js -i 4