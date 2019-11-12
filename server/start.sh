#!/bin/sh
nohup node apps/center_server/center_server.js &
nohup node apps/system_srver/system_server.js &
nohup node apps/game_server/game_server.js &
nohup node apps/gateway/gateway.js &
nohup node apps/webserver/webserver.js &