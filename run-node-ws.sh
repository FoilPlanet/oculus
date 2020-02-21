#!/bin/sh

SOCK_NAME=minicap
TCP_PORT=${1:-1717}

case $TCP_PORT in
  1717)
    echo "Using default 1717 port for adb forward $SOCK_NAME"
    adb forward tcp:$TCP_PORT localabstract:$SOCK_NAME
    ;;
  *)
    # echo "Using host server $TCP_PORT"
    ;;
esac

cd node-minicap-fp && node server-minicap.js $TCP_PORT
