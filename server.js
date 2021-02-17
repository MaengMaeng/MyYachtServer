const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

const port = 8080;

// io = [socket, socket]
let roomNumber = 0;
let member = 0;


io.on('connection', (socket) => {
    console.log('user connection');

    if(member == 2){
        roomNumber++;
        member = 0;
    }

    console.log('room number : ', roomNumber);
    socket.roomNumber = roomNumber;
    socket.join(roomNumber);
    member++;
    console.log('member : ', member);
    
    socket.on('hold', (data) => {
        io.to(socket.roomNumber).emit('hold', data);
    });
});

http.listen(port, () => {
    console.log('connection');
});