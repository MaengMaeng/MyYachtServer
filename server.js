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

let roomNumber = 0;
const gameRoom = [];

io.on('connection', (socket) => {
    console.log('user connection');

    socket.on('matching', (data) => {
        if(gameRoom.length){
            socket.roomNumber = gameRoom.shift();
            socket.join(socket.roomNumber);
            
            io.to(socket.roomNumber).emit('matched', '');
        }
        else{
            gameRoom.push(roomNumber)
            socket.roomNumber = roomNumber;
            socket.join(roomNumber++);
        }
        console.log('room number : ', socket.roomNumber);
    });
    
    socket.on('matchingCancel', (data) => {
        gameRoom.shift();
        socket.leave(socket.roomNumber);
    });

    socket.on('hold', (data) => {
        io.to(socket.roomNumber).emit('hold', data);
    });
});

http.listen(port, () => {
    console.log('connection');
});