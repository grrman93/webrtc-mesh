var SimplePeer = require('simple-peer');
var io = require('socket.io-client');
var socket = io();

var peerConnections; 

var config = {};

// someone has joined the room
socket.on('new.peer', function(sockets) {
  var length = sockets.length;
  var initiatorId = sockets[length - 1].id;
  if (length > 1) {
    // this client will act as initiator for the new connections 
    if (initiatorId === socket.id) {
      peerConnections = {};
      startConnection(sockets, 0);
    // client will act as remote waiting for initiator's offer
    } else {
      receiveConnection(initiatorId);
    }
  }
});

socket.on('answer', function(data) {
  if (data.to === socket.id) {
    var connection = peerConnections[data.by];
    if (!connection.connected) {
      connection.peer.signal(data.answer);
      connection.connected = true;
    }
  }
});

socket.on('full', function() {
  console.log('room is full');
});

var room = 0;
socket.emit('join', room);

// set up connection as initiator
function startConnection(sockets, number) {
  var peer = new SimplePeer({ initiator: true, trickle: false });
  peerConnections[sockets[number].id] = { peer: peer, connected: false, by: socket.id, to: sockets[number].id }; 

  peer.on('signal', function(data) {
    socket.emit('offer', { offer: data, by: socket.id, to: sockets[number].id });
  });

  peer.on('connect', function() {
    peer.send('some data sent from socket' + socket.id);
    
    // check if we need to make more connections
    if (number < sockets.length - 1) {
      startConnection(sockets, number + 1); 
    }
  });
  
  peer.on('data', function(data) {
    console.log('ive received data', data);
  });
}

// act as remote
function receiveConnection(initiatorId) {
  var self = new SimplePeer({ initiator: false, trickle: false });
  self.on('signal', function(data) {
    socket.emit('answer', { answer: data, by: socket.id, to: initiatorId }); 
  });

  socket.on('offer', function(data) {
    if (data.to === socket.id) {
      self.signal(data.offer);
    }
  });

  self.on('connect', function() {
    //self.send('i am connected and sending', socket.id);
  });

  self.on('data', function(data) {
    console.log('got some data ' + data);
  });
}

