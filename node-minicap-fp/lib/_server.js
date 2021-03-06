"use strict";

const WebSocketServer = require('ws').Server;
const Splitter        = require('stream-split');
const merge           = require('mout/object/merge');
const fs              = require("fs");

const NALseparator    = new Buffer([0,0,0,1]);//NAL break

class _Server {

  constructor(server, options) {

    this.options = merge({
        width : 960,
        height: 540,
    }, options);

    this.wss = new WebSocketServer({ server });

    this.new_client = this.new_client.bind(this);
    this.start_feed = this.start_feed.bind(this);
    this.stop_feed  = this.stop_feed.bind(this);
    this.broadcast  = this.broadcast.bind(this);

    this.wss.on('connection', this.new_client);
  }

  start_feed() {
    var readStream = this.get_feed();
    this.readStream = readStream;

    readStream = readStream.pipe(new Splitter(NALseparator));
    readStream.on("data", this.broadcast);

    if (this.options.output_path) {
      var writerStream = fs.createWriteStream(this.options.output_path);
      this.writerStream = writerStream;
    }
  }

  stop_feed() {
    this.readStream.pause();
    if (this.writerStream) {
      this.writerStream.end();
    }
  }

  get_feed() {
    throw new Error("to be implemented");
  }

  broadcast(data) {
    var frame = Buffer.concat([NALseparator, data]);

    this.wss.clients.forEach(function(socket) {

      if(socket.buzy)
        return;

      socket.buzy = true;
    //socket.buzy = false;

      socket.send(frame, { binary: true }, function ack(error) {
        socket.buzy = false;
      });
    });
    
    // dump to file / write stream
    if (this.writerStream) {
      this.writerStream.write(frame);
    }
  }

  new_client(socket, req) {
  
    var self = this;
    console.info('Got a client %s:%d', req.connection.remoteAddress, req.connection.remotePort)
    
    socket.send(JSON.stringify({
      action : "init",
      width  : this.options.width,
      height : this.options.height,
    }));

    socket.on("message", function(data){
      var cmd = "" + data, action = data.split(' ')[0];
      console.log("Incomming action '%s'", action);

      if (action == "REQUESTSTREAM")
        self.start_feed();
      if (action == "STOPSTREAM")
        self.stop_feed();
    });

    socket.on('close', function() {
      if (self.readStream)
        self.readStream.end();
      console.log('Close client %s:%d', socket._socket.remoteAddress, socket._socket.remotePort);
    });
  }
};

module.exports = _Server;
