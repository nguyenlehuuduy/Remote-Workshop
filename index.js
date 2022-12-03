const express = require("express"); //Yêu cầu express
const app = express(); // app có tất cả các thuộc tính của express
const server = require("http").Server(app); //Tạo http server
const io = require("socket.io")(server); //socket chạy trên máy chủ này
const { ExpressPeerServer } = require("peer"); //WebRTC api cho giao tiếp truyền thông thực
const PORT = process.env.PORT || 3000; //cổng mà máy chủ chạy

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(express.static("./assets")); //thiết lập đường dẫn tĩnh
app.set("view engine", "ejs"); //Thiết lập công cụ xem
app.set("views", "./views"); //thiết lập đường dẫn xem
app.use("/", require("./routes/index"));

//socket điều khiển người dùng tham gia / rời khỏi và nhắn tin
io.on("connection", (socket) => {
  //request for joining room
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId); //tham gia phòng được đề cập
    socket.broadcast.to(roomId).emit("user-connected", userId, userName);
    socket.on("send-message", (inputMsg, userName) => {
      io.to(roomId).emit("recieve-message", inputMsg, userName);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId, userName);
    });
  });
});

//chạy máy chủ
server.listen(PORT, function (err) {
  if (err) {
    console.log(
      `Error :: ${err} occured while starting the server in index.js!`
    );
  }
  console.log(`Server is up and running on port ${PORT}`);
});
