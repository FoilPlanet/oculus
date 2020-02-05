# minicap over WebSockets

1. Enable raw H.264 support

2. Multiple windows for anbox android (TBD)

## Requirements

* [Node.js](https://nodejs.org/) >= v8.10.0
* [ADB](http://developer.android.com/intl/ja/tools/help/adb.html)

## Running

1. Check that your device is connected and ADB is running with `adb devices`. The following steps may not work properly if you don't.

    ```Bash
    adb devices
    ```

2. Set up a forward for the server we'll soon have running inside the device. Note that due to laziness the port is currently fixed to 1717.

    ```Bash
    adb forward tcp:1717 localabstract:minicap
    ```

3. Get information about your display. Unfortunately the easy API methods we could use for automatic detection segfault on some Samsung devices, presumably due to maker customizations. You'll need to know the display width and height in pixels. Here are some ways to do it:

    ```Bash
    adb shell wm size
    adb shell dumpsys display
    ```

4. Start the minicap server. The most convenient way is to use the helper script at the root of this repo.

    ```Bash
    # Try ./run-device.sh help for help
    ./run-devie.sh avc
    ```

5. Start this app.

    ```Bash
    # install packages on first run
    npm install
    ```

    ```Bash
    # start minicap
    node server-minicap.js
    ```

    ```Bash
    # Other applications from h264-live-player
    node server-rpi.js    # run on a raspberry device for a webcam demo
    node server-static.js # for sample video (static) file delivery
    node server-ffmpeg    # usefull on win32 to debug the live feed (use ffmpeg & your directshow device / webcam)
    ```

6. Browse to http://localhost:9002 for a demo.

    * minicap JPEG encoder can still be used by access [index_legacy.html](http://localhost:9002/index_legacy.html)

## To Check

* Broadway h264 Decoder can only work with **h264 baseline profile**

* [**Use a SANE birate**](https://www.dr-lex.be/info-stuff/videocalc.html)

* Use [uws](https://github.com/uWebSockets/uWebSockets) (instead of ws) as websocket server

* [wfs.js (html5 player for raw h.264 streams)](https://github.com/ChihChengYang/wfs.js) and [hls.js](https://github.com/dailymotion/hls.js)

## Credits

These npm packages are in folder _vendor_

* [131/h264-live-player](https://github.com/131/h264-live-player)

* [Broadway](https://github.com/mbebenita/Broadway)

* [urbenlegend/WebStreamer](https://github.com/urbenlegend/WebStreamer)