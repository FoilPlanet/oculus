"use strict";

const http               = require('http');
const express            = require('express');
const RemoteTCPFeedRelay = require('./lib/static');
const app                = express();

//public website
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor/dist'));

const server  = http.createServer(app);

var source = {
  width     : 960,
  height    : 540,

  video_path     : "samples/test.h264",
  video_duration : 58,
};

const feed    = new RemoteTCPFeedRelay(server, source);

// server.listen(8080);
server.listen(9002);
