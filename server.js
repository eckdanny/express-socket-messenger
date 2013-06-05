var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , util = require('util');

app.configure(function() {
   app.use(express.static(__dirname + '/public'));
});

// io.set('log level', 2);
// io.enable('browser client minification');  // send minified client
// io.enable('browser client etag');          // apply etag caching logic based on version number
// io.enable('browser client gzip');          // gzip the file
// io.set('log level', 1);                    // reduce logging

io.sockets.on('connection', function (socket) {

   socket.send('Connection established!', function () {
      // ack
   });

   socket.on('subscribe', function (data) {
      socket.join(data.room);
      console.log('-> ' + socket.id + ' was added to room: ' + data.room);
   });

   console.log('-> client ' + socket.id + ' has connected');
   console.log('-> there are now ' + io.sockets.clients().length + ' connection(s)');

   socket.on('disconnect', function () {
      console.log('-> client ' + socket.id + ' has disconnected');
      console.log('-> there are now ' + io.sockets.clients().length + ' connection(s)');
   });

   socket.on('requestSubmitted', function (data) {
      console.log('-> A new request has been submitted!');
      console.log({ "clientId" : socket.id, "request": data });
      io.sockets.in('associates').emit('requestQueueUpdated', {
         "clientId" : socket.id,
         "request": data
      });
   });

   socket.on('itemProcessed', function (data) {
      console.log('-> Associate has retrieved an item!');
      io.sockets.socket(data.clientId).emit('itemReady');
   })
});

server.listen(8080, '10.27.33.43');
