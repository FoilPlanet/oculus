/*
 * Copyright (c) 2019-2020 FoilPlanet. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const net    = require('net');
const merge  = require('mout/object/merge');
const stream = require('stream');
const Server = require('./_server');

class MinicapTCPFeed extends Server {

  constructor(server, opts) {
    super(server, merge({
      feed_ip   : '127.0.0.1',
      feed_port : 1717,
    }, opts));
  }

  stop_feed() {
    this.readStream.end();
    this.netStream.end();
  }

  get_feed() {
    this.connect_minicap(this.options.feed_port, this.options.feed_ip);

    /*
     * we create a local bufferStream as a feed (no data), but use 
     * this.broadcast() to actually send frames
     */
    var bufferStream = new stream.PassThrough();
    this.bufferStream = bufferStream;
    // bufferStream.end(new Buffer(raw_frame));
    return bufferStream;
  }

  broadcast_frame(data) {
    this.wss.clients.forEach(function(socket) {
      if (socket.buzy) {
        console.log("ws socket buzy");
        return;
      }
      socket.buzy = true;
      // socket.send(data, { binary: true }); // noack
      // socket.buzy = false;
      socket.send(data, { binary: true }, function ack(error) {
        socket.buzy = false;
      });
    });
  }

  connect_minicap(port, ip) {
    var stream = net.connect(port, ip, function(){
      console.log("remote stream ready");
    })

    this.netStream = stream;

    stream.on('error', function() {
      console.error('Be sure to run `adb forward tcp: %d localabstract:minicap', port)
      process.exit(1)
    })

    var readBannerBytes = 0
    var bannerLength = 2
    var readFrameBytes = 0
    var frameBodyLength = 0
    var frameBody = new Buffer(0)
    var banner = {
      version: 0, 
      length: 0,
      pid: 0, 
      realWidth: 0,
      realHeight: 0,
      virtualWidth: 0,
      virtualHeight: 0,
      orientation: 0, 
      quirks: 0
    }

    var broadcast_stream = this.broadcast;
    var broadcast_frame  = this.broadcast_frame.bind(this);

    function tryRead() {
      for (var chunk; (chunk = stream.read());) {
        console.info('chunk(len=%d)', chunk.length)
        for (var cursor = 0, len = chunk.length; cursor < len;) {
          if (readBannerBytes < bannerLength) {
            switch (readBannerBytes) {
            case 0:
              // version
              banner.version = chunk[cursor]
              break
            case 1:
              // length
              banner.length = bannerLength = chunk[cursor]
              break
            case 2:
            case 3:
            case 4:
            case 5:
              // pid
              banner.pid +=
                (chunk[cursor] << ((readBannerBytes - 2) * 8)) >>> 0
              break
            case 6:
            case 7:
            case 8:
            case 9:
              // real width
              banner.realWidth +=
                (chunk[cursor] << ((readBannerBytes - 6) * 8)) >>> 0
              break
            case 10:
            case 11:
            case 12:
            case 13:
              // real height
              banner.realHeight +=
                (chunk[cursor] << ((readBannerBytes - 10) * 8)) >>> 0
              break
            case 14:
            case 15:
            case 16:
            case 17:
              // virtual width
              banner.virtualWidth +=
                (chunk[cursor] << ((readBannerBytes - 14) * 8)) >>> 0
              break
            case 18:
            case 19:
            case 20:
            case 21:
              // virtual height
              banner.virtualHeight +=
                (chunk[cursor] << ((readBannerBytes - 18) * 8)) >>> 0
              break
            case 22:
              // orientation
              banner.orientation += chunk[cursor] * 90
              break
            case 23:
              // quirks
              banner.quirks = chunk[cursor]
              break
            }
  
            cursor += 1
            readBannerBytes += 1
  
            if (readBannerBytes === bannerLength) {
              console.log('banner', banner)
            }
          }
          else if (readFrameBytes < 4) {
            frameBodyLength += (chunk[cursor] << (readFrameBytes * 8)) >>> 0
            cursor += 1
            readFrameBytes += 1
            // console.info('headerbyte%d(val=%d)', readFrameBytes, frameBodyLength)
          }
          else {
            if (len - cursor >= frameBodyLength) {
              console.info('bodyfin(len=%d,cursor=%d)', frameBodyLength, cursor)
  
              frameBody = Buffer.concat([
                frameBody
              , chunk.slice(cursor, cursor + frameBodyLength)
              ])
  
              // Sanity check for JPG header, only here for debugging purposes.
              if (frameBody[0] !== 0xFF || frameBody[1] !== 0xD8) {
                broadcast_stream(frameBody) // avc/h.264 stream
                console.debug("t-%s", frameBody[0].toString(16)); // frame type
              } else {
                broadcast_frame(frameBody)  // jpeg image
                console.debug(".");
              }
  
              cursor += frameBodyLength
              frameBodyLength = readFrameBytes = 0
              frameBody = new Buffer(0)
            }
            else {
              console.info('body(len=%d)', len - cursor)
  
              frameBody = Buffer.concat([
                frameBody
              , chunk.slice(cursor, len)
              ])
  
              frameBodyLength -= len - cursor
              readFrameBytes += len - cursor
              cursor = len
            }
          }
        }
      }
    } // tryRead

    stream.on('readable', tryRead)

    this.wss.on('close', function() {
      console.info('Lost a client')
      stream.end()
    })
  } // connect_minicap_tcp
}

module.exports = MinicapTCPFeed;
