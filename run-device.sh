#!/bin/bash

DIST=minicap
TARGET=/data/local/tmp
ANDROID_ABI=x86_64
ANDROID_SDK=25

FRATES=30
# CODING=jpeg
CODING=${1:-avc}
SOCKFD="-f 0"
# SOCKFD=""

function get_device_abi() {
  TARGET=$(adb shell uname -m)
  case $TARGET in
    aarch64)
      ABI=arm64-v8a
      ;;
    *)
      ABI=$TARGET
      ;;
  esac
  echo $ABI
}

case $1 in
  pull)
    echo "Pulling programs from source tree..."
    cp -av ../minicap/libs/x86_64/minicap      $DIST/x86_64
    cp -av ../minicap/libs/x86_64/libmpp.so    $DIST/x86_64
   #cp -av ../minicap/libs/x86_64/libvpu.so    $DIST/x86_64
    cp -av ../minicap/jni/minicap-shared/aosp/libs/android-${ANDROID_SDK}/x86_64/minicap.so $DIST/x86_64
    cp -av ../minicap/libs/arm64-v8a/minicap   $DIST/arm64-v8a
    cp -av ../minicap/libs/arm64-v8a/libmpp.so $DIST/arm64-v8a
   #cp -av ../minicap/libs/arm64-v8a/libvpu.so $DIST/arm64-v8a
    cp -av ../minicap/jni/minicap-shared/aosp/libs/android-${ANDROID_SDK}/arm64-v8a/minicap.so $DIST/arm64-v8a
    ;;
  push)
    echo "Checking device..."
    ANDROID_ABI=$(get_device_abi)
    TARGET_VERSION=$(adb shell getprop ro.build.version.release)
    TARGET_SDK=$(adb shell getprop ro.build.version.sdk)
    TARGET_MODEL=$(adb shell getprop ro.product.model)
    echo "Device model ${TARGET_MODEL}"
    echo "Android ${TARGET_VERSION} ${ANDROID_ABI} SDK ${TARGET_SDK}"
    echo "Pushing programs to device..."
    adb push $DIST/${ANDROID_ABI}/minicap    $TARGET
    adb push $DIST/${ANDROID_ABI}/libmpp.so  $TARGET
   #adb push $DIST/${ANDROID_ABI}/libvpu.so  $TARGET
    adb push $DIST/${ANDROID_ABI}/minicap.so $TARGET
    ;;
  push-x264)
    ANDROID_ABI=$(get_device_abi)
    adb push $DIST/${ANDROID_ABI}/libmpp-x264.so  $TARGET/libmpp.so
    ;;
  *)
    echo "Runing minicap for testing"
    ANDROID_ABI=$(get_device_abi)
    # screensaver
    # adb shell su 0 am start -n com.android.deskclock/.ScreensaverActivity
    # show Clock
    adb shell am start com.android.deskclock/.DeskClock -ei deskclock.select.tab 3
    # start stopwatcher
    sleep 1
    case $ANDROID_ABI in
    arm64-v8a)
      WIDTH=800
      HEIGHT=600
      adb shell input tap 600 20
      adb shell input tap 400 560
      ;;
    *)
      WIDTH=800
      HEIGHT=600
      adb shell input tap 600 20
      adb shell input tap 400 560
      ;;
    esac
    # run minicap
    PROJECTION=${WIDTH}x${HEIGHT}@${WIDTH}x${HEIGHT}/0
    adb shell LD_LIBRARY_PATH=$TARGET $TARGET/minicap -P $PROJECTION -r $FRATES -C $CODING $SOCKFD
    ;;
esac

echo "done."
