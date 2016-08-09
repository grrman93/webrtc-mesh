const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

var rooms = {};
io.on('connection', function(socket) {
  socket.on('join', function(room) {
    console.log('joining room', room);
    var numberOfClients = io.clients(room).length;
    if (numberOfClients >= 4) {
      socket.emit('full', room);
    } else {
      socket.join(room);
      rooms[room] = rooms[room] || [];
      var order = rooms[room].length + 1;
      rooms[room].push({id: socket.id.slice(2), order: order });
      io.in(room).emit('new.peer', rooms[room]);
    }
  });

  socket.on('offer', function(offer) {
    socket.broadcast.emit('offer', offer);
  })

  socket.on('answer', function(data) {
    socket.broadcast.emit('answer', data); 
  });
});

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile(__dirname + './index.html');
});

server.listen(3000, function() {
  console.log('Listening');
});
