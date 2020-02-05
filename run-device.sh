#!/bin/bash

SOURCE=minicap/x86_64/
TARGET=/data/local/tmp
PROJECTION=800x600@800x600/0
FRATES=30
# CODING=jpeg
CODING=${1:-avc}

case $1 in
  push)
    adb push $SOURCE/minicap    $TARGET
    adb push $SOURCE/libmpp.so  $TARGET
   #adb push $SOURCE/libvpu.so  $TARGET
    ;;
  *)
    # screensaver
    # adb shell su 0 am start -n com.android.deskclock/.ScreensaverActivity
    # show Clock
    adb shell am start com.android.deskclock/.DeskClock -ei deskclock.select.tab 3
    # start stopwatcher
    sleep 1
    adb shell input tap 600 20
    adb shell input tap 400 560
    # run minicap
    adb shell LD_LIBRARY_PATH=$TARGET $TARGET/minicap -P $PROJECTION -r $FRATES -C $CODING
    ;;
esac

echo "done."
