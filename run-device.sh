#!/bin/bash

DIST=minicap
TARGET=/data/local/tmp
ANDROID_ABI=x86_64

PROJECTION=800x600@800x600/0
FRATES=30
# CODING=jpeg
CODING=${1:-avc}
SOCKFD="-f 0"

case $1 in
  pull)
    echo "Pulling programs from source tree..."
    cp -av ../minicap/libs/x86_64/minicap      $DIST/x86_64
    cp -av ../minicap/libs/x86_64/libmpp.so    $DIST/x86_64
   #cp -av ../minicap/libs/x86_64/libvpu.so    $DIST/x86_64
    cp -av ../minicap/libs/arm64-v8a/minicap   $DIST/arm64-v8a
    cp -av ../minicap/libs/arm64-v8a/libmpp.so $DIST/arm64-v8a
   #cp -av ../minicap/libs/arm64-v8a/libvpu.so $DIST/arm64-v8a
    ;;
  push)
    echo "Pushing programs to device..."
    adb push $DIST/${ANDROID_ABI}/minicap    $TARGET
    adb push $DIST/${ANDROID_ABI}/libmpp.so  $TARGET
   #adb push $DIST/${ANDROID_ABI}/libvpu.so  $TARGET
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
    adb shell LD_LIBRARY_PATH=$TARGET $TARGET/minicap -P $PROJECTION -r $FRATES -C $CODING $SOCKFD
    ;;
esac

echo "done."
