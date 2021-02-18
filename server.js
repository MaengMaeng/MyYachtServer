const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = 8080;

// io = [socket, socket]
let roomNumber = 0;
let memberNumber = 0;

const INIT_HOLD_DICES = [false, false, false, false, false];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on("connection", (socket) => {
  console.log("user connection");

  if (memberNumber % 2 == 0) {
    roomNumber++;
  }

  console.log("room number : ", roomNumber);
  socket.roomNumber = roomNumber;
  socket.memberNumber = memberNumber;
  socket.join(roomNumber);
  memberNumber++;
  console.log("member : ", memberNumber);

  if (memberNumber % 2 == 0) {
    // 나를 제외한 방에 있는 사람들에게
    socket.broadcast.to(socket.roomNumber).emit("next_turn", true);
  }

  socket.on("roll", (data) => {
    let dices = data.dices.slice();
    let holddDices = data.holddDices.slice();
    let rollDices = [];
    for (let i = 0; i < 5; i++) {
      if (holddDices[i]) {
        rollDices.push(dices[i]);
      } else {
        rollDices.push(getRandomInt(1, 6));
      }
    }
    io.to(socket.roomNumber).emit("roll", rollDices);
  });

  socket.on("next_turn", () => {
    io.to(socket.id).emit("next_turn", false); // 자신은 turn false.
    socket.broadcast.to(socket.roomNumber).emit("next_turn", true);

    io.to(socket.roomNumber).emit("hold", INIT_HOLD_DICES);
  });

  socket.on("hold", (data) => {
    io.to(socket.roomNumber).emit("hold", data);
  });
});

http.listen(port, () => {
  console.log("connection");
});
