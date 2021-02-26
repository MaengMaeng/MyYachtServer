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
let turnCount = 0;

io.on("connection", (socket) => {
  console.log("user connection");
  const game = {
    score: {},
    dices: [],
    holdPedigree: "",
    rollCount: 0,
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
    const holdPedigreeTitle = game.holdPedigree;
    const pediScore = pc.calculate(holdPedigreeTitle, game.dices);
    if (pediScore.holdPedigree) {
      // 이미 존재하는 족보에 대한 처리
      console.log("족보에 이미 기재되어있음");
    }

    game.score[holdPedigreeTitle] = pediScore;
    console.log(game);

    // 초기화 작업
    // turn 부여보다 먼저해야지만 화면이 자연스럽다. 수정할 것
    io.to(socket.roomNumber).emit("holdPedigree", "");

    io.to(socket.roomNumber).emit("hold", INIT_HOLD_DICES);

    game.rollCount = 0;
    io.to(socket.roomNumber).emit("countRolls", game.rollCount);
    turnCount++;
    console.log("turnCount", turnCount);

    io.to(socket.id).emit("updateScore", game.score, true); // 내 점수
    socket.broadcast
      .to(socket.roomNumber)
      .emit("updateScore", game.score, false); // 상대 점수

    game.dices = [];
    io.to(socket.roomNumber).emit("rollDices", []);

    io.to(socket.id).emit("submit", false); // 자신은 turn false.
    socket.broadcast.to(socket.roomNumber).emit("submit", true);
  });

  socket.on("hold", (data) => {
    io.to(socket.roomNumber).emit("hold", data);
  });
  socket.on("holdPedigree", (data) => {
    game.holdPedigree = data;
    io.to(socket.roomNumber).emit("holdPedigree", data);
  });
});

http.listen(port, () => {
  console.log("connection");
});
