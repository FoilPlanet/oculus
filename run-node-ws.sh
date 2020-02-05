#!/bin/sh

SOCK_NAME=minicap
TCP_PORT=1717

adb forward tcp:$TCP_PORT localabstract:$SOCK_NAME
cd node-minicap-fp && node server-minicap.js
