const { on } = require("events");

const app = require("express")();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});

userList = [];
privateRooms = [];
const port = 8080;

online_user = [];
online_group = [];

io.on("connection", (socket) => {
  console.log("user connected");

  // io.emit('ID', socket.id)

  socket.on("join", function (data) {
    // console.log(data,'join');

    const roomIndex = privateRooms.findIndex((room) => room === data);
    // console.log(roomIndex);
    const roomExist = roomIndex > -1;
    if (!roomExist) {
      privateRooms.push(data);
    }
    // console.log(privateRooms);

    socket.join(data);

    socket.broadcast
      .to(data)
      .emit("new user joined", { message: "has joined this room." });

    // socket.emit(message.room).emit('new user joined', {user:message.user, message:'has joined this room.'})
  });

  socket.on("loggedIn", (data) => {
    // let user_index = online_user.findIndex(item => item.username == data.username)
    console.log(data, "darataa");
    if (data.type == "private") {
      online_user.push({
        ...data,
        socket_id: socket.id,
      });
    } else if (data.type == "group") {
      console.log(online_group.length);
      let index = online_group.findIndex((item) => item.username == data.username);
      if(index < 0){
        online_group.push({
          ...data,
          socket_id: socket.id,
        });  
      }else{
       
      }
    }

    io.emit("UsersLogged", online_user, online_group);
  });

  socket.on("chat", (data, my_detail) => {
    // console.log(data,my_detail);
    if (data.type == "group") {
      console.log(data, "chatdata");
      socket.join(data.socket_id);
      socket.broadcast.to(data.socket_id).emit("new user joined", {
        user: data.user_id,
        message: "has joined this room.",
      });
      io.emit("room_id", data.socket_id);
    } else {
      console.log(data);
      let data1 = [data.username, my_detail.username];
      console.log(data1, "jcvjx");
      data1.sort();
      let room_id = "";
      for (let index = 0; index < data1.length; index++) {
        room_id = room_id + data1[index];
      }
      socket.join(room_id);
      io.emit("room_id", room_id);
    }
  });

  socket.on("leave", (message) => {
    console.log(message, "leave");

    console.log(message.user + " left the room");

    socket.leave(message.room);

    socket.broadcast
      .to(message.room)
      .emit("User left", { user: message.user, message: "has left the group" });

    // io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
  });

  socket.on("send_message", (data) => {
    console.log(data, "jqcvwycvqeucyu");
    io.in(data.room_id).emit("update_session_storage", data);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    let data = online_user.filter((data) => data.socket_id == socket.id);
    online_user = online_user.filter((data) => data.socket_id != socket.id);
    // console.log(online_user[0].username,'adcjhvdhcvsdjh');

    io.emit("OnlineUsers", online_user, data);
  });
});

httpServer.listen(port, () => {
  console.log(`port ${port}`);
});
