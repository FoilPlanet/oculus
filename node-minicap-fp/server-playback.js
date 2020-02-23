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
const RemoteTCPFeedRelay = require('./lib/static');
const app                = express();

//public website
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor/dist'));

const server  = http.createServer(app);
const http_port = 9002;

var args = process.argv.slice(2);
var inputfile = "samples/out.h264";

if (args[0]) {
  inputfile = args[0];
}

var source = {
  width     : 800,
  height    : 600,

  video_path     : inputfile,
  video_duration : 58,
};

const feed    = new RemoteTCPFeedRelay(server, source);

server.listen(http_port);
console.info('Listening on port %d', http_port);
console.info('Loading stream from "%s"', inputfile);
