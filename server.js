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

const pc = require("./PedigreeCalcurator.js");
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
    /*
    만약에 재접속시 두명다 turn을 갖게되는 경우 생길수 있음
    전체적인 코드(memeberNumber++ 등) 변경 시, 같이 보수할 것 
    */
    // 나를 제외한 방에 있는 사람들에게
    socket.broadcast.to(socket.roomNumber).emit("submit", true);
  }

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
    io.to(socket.roomNumber).emit("roll", rollDices);

    // roll count
    let rollCount = data.rollCount;
    io.to(socket.roomNumber).emit("roll_count", rollCount + 1);

    const counts = pc.makeCountArray(rollDices);
    // 족보 계산값
    const calcuratedData = {
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
    io.to(socket.roomNumber).emit("pre_calcurate", calcuratedData);
  });

  socket.on("submit", () => {
    io.to(socket.id).emit("submit", false); // 자신은 turn false.
    socket.broadcast.to(socket.roomNumber).emit("submit", true);

    io.to(socket.roomNumber).emit("hold", INIT_HOLD_DICES);

    io.to(socket.roomNumber).emit("roll_count", 0);
  });

  socket.on("hold", (data) => {
    io.to(socket.roomNumber).emit("hold", data);
  });
});

http.listen(port, () => {
  console.log("connection");
});
