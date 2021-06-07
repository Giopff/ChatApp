const express = require("express");
const app = express();
const PORT = 3000;
const server = require("http").createServer(app);

const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

server.listen(PORT, () => {
  console.log(`Listening to the port: ${PORT}`);
});
const userInfo = {};
io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);
  socket.on("send-info", (obj) => {
    socket.nickname = obj["nickname"];
    socket.cords = obj["cords"];
    userInfo[socket.nickname] = socket.cords;
    socket.emit("user-infovar", userInfo);
  });
  socket.on("active", (rooms) => {});
  socket.on("message", (msg) => {
    socket
      .to(msg["room_name"])
      .emit("message", { message: msg["message"], nickname: msg["nickname"] });
  });
  socket.on("create", (room) => {
    socket.join(room);
  });
  socket.on("disconnect", () => {
    console.log("Got disconnected!");
    delete userInfo[socket.nickname];
  });
});
