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

const http               = require('http');
const express            = require('express');
const RemoteTCPFeedRelay = require('./lib/minicaptcp');
const app                = express();

/**
 * on the remote android device (with minicap) run
 *   minicap -C avc
 * to create a raw tcp h264 streamer (using adb forward)
 *   adb forward tcp:1717 localabstract:minicap
 */

// public website
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor/dist'));

const server  = http.createServer(app);
const http_port = 9002;

var args = process.argv.slice(2);
var port = 1717;

if (args[0]) {
  port = args[0];
}

const feed    = new RemoteTCPFeedRelay(server, {
  feed_ip:   "127.0.0.1",
  feed_port: port,
  width:     800,
  height:    600,
  output_path: "samples/out.h264"
});

server.listen(http_port);
console.info('Connect feed port %d', port);
console.info('Listening on port %d', http_port)

