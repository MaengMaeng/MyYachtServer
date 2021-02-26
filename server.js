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
const gameRoom = [];

const INIT_HOLD_DICES = [false, false, false, false, false];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on("connection", (socket) => {
  console.log("user connection");

  const game = {
    player1: {},
    player2: {},
    rollCount: 0,
    dices: [],
    turnNumber: 0,
  };

  socket.on("matching", (data) => {
    if (gameRoom.length) {
      socket.roomNumber = gameRoom.shift();
      socket.join(socket.roomNumber);

      io.to(socket.roomNumber).emit("matched", "");

      // 나를 제외한 방에 있는 사람들에게 turn 부여
      socket.broadcast.to(socket.roomNumber).emit("submit", true);
    } else {
      gameRoom.push(roomNumber);
      socket.roomNumber = roomNumber;
      socket.join(roomNumber++);
    }
    console.log("room number : ", socket.roomNumber);
  });

  socket.on("matchingCancel", (data) => {
    gameRoom.shift();
    socket.leave(socket.roomNumber);
  });

  socket.on("roll", (data) => {
    // roll dice
    let holddDices = data.slice();
    let rollDices = [];
    for (let i = 0; i < 5; i++) {
      if (holddDices[i]) {
        rollDices.push(game.dices[i]);
      } else {
        rollDices.push(getRandomInt(1, 6));
      }
    }
    game.dices = rollDices;
    io.to(socket.roomNumber).emit("rollDices", rollDices);

    // roll count
    let rollCount = game.rollCount + 1;
    game.rollCount = rollCount;
    io.to(socket.roomNumber).emit("countRolls", rollCount);
  });

  socket.on("submit", () => {
    // turn 부여보다 먼저해야함
    io.to(socket.roomNumber).emit("holdPedigree", "");

    io.to(socket.id).emit("submit", false); // 자신은 turn false.
    socket.broadcast.to(socket.roomNumber).emit("submit", true);

    // init
    io.to(socket.roomNumber).emit("hold", INIT_HOLD_DICES);
    io.to(socket.roomNumber).emit("countRolls", 0);
    // io.to(socket.roomNumber).emit("preCalculateMyScore", calculatedData);
    // io.to(socket.id).emit("preCalculateMyScore", {});
    // socket.broadcast
    //   .to(socket.roomNumber)
    //   .emit("preCalculateRivalScore", {});
  });

  socket.on("hold", (data) => {
    io.to(socket.roomNumber).emit("hold", data);
  });
  socket.on("holdPedigree", (data) => {
    io.to(socket.roomNumber).emit("holdPedigree", data);
  });
});

http.listen(port, () => {
  console.log("connection");
});
