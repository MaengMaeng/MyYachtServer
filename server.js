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

const pc = require("./PedigreeCalculator.js");
// io = [socket, socket]
let roomNumber = 0;
const gameRoom = [];

const INIT_HOLD_DICES = [false, false, false, false, false];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on("connection", (socket) => {
  console.log("user connection");

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
    io.to(socket.roomNumber).emit("rollDices", rollDices);

    // roll count
    let rollCount = data.rollCount;
    io.to(socket.roomNumber).emit("countRolls", rollCount + 1);

    const counts = pc.makeCountArray(rollDices);
    // 족보 계산값
    const calculatedData = {
      Aces: pc.calSingle(counts, 1),
      Duces: pc.calSingle(counts, 2),
      Threes: pc.calSingle(counts, 3),
      Fours: pc.calSingle(counts, 4),
      Fives: pc.calSingle(counts, 5),
      Sixes: pc.calSingle(counts, 6),
      Choice: pc.calSum(counts),
      "4 Of a Kind": pc.cal4OfAKind(counts),
      "Full House": pc.calFullHouse(counts),
      "Small Straight": pc.calSmallStraight(counts),
      "Large Straight": pc.calLargeStraight(counts),
      Yacht: pc.calYatch(counts),
    };

    io.to(socket.id).emit("preCalculateMyScore", calculatedData);
    socket.broadcast
      .to(socket.roomNumber)
      .emit("preCalculateRivalScore", calculatedData);
  });

  socket.on("submit", () => {
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
