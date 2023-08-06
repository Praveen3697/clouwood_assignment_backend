const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 4000;

let lights = {
  Bedroom: { 1: false, 2: false },
  Kitchen: { 1: false, 2: false },
};

io.on("connection", (socket) => {
  console.log("User connected");
  socket.emit("message", {
    type: "INITIAL_STATE",
    payload: lights,
  });

  socket.on("message", (message) => {
    const { type, payload } = message;

    /**
     * Socket gets the request from Client
     * It conditionally checks the type of action and emit the message accordingly.
     */

    if (type === "TOGGLE_LIGHT") {
      const { room, lightNumber, value } = payload;
      lights[room][lightNumber] = value;

      io.emit("message", {
        type: "LIGHT_STATE_CHANGED",
        payload: {
          room,
          lightNumber,
          value,
        },
      });
    } else if (type === "TURN_BOTH_ON") {
      const { room } = payload;
      lights[room][1] = true;
      lights[room][2] = true;

      io.emit("message", {
        type: "BOTH_ON",
        payload: {
          room,
        },
      });
    } else if (type === "TURN_BOTH_OFF") {
      const { room } = payload;
      lights[room][1] = false;
      lights[room][2] = false;

      io.emit("message", {
        type: "BOTH_OFF",
        payload: {
          room,
        },
      });
    } else if (type === "TURN_ALL_ON") {
      const { roomOne, roomTwo } = payload;
      lights[roomOne][1] = true;
      lights[roomOne][2] = true;
      lights[roomTwo][1] = true;
      lights[roomTwo][2] = true;

      io.emit("message", {
        type: "ALL_ON",
        payload: {
          roomOne,
          roomTwo,
        },
      });
    } else if (type === "TURN_ALL_OFF") {
      const { roomOne, roomTwo } = payload;
      lights[roomOne][1] = false;
      lights[roomOne][2] = false;
      lights[roomTwo][1] = false;
      lights[roomTwo][2] = false;

      io.emit("message", {
        type: "ALL_OFF",
        payload: {
          roomOne,
          roomTwo,
        },
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
