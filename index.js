const app  = require('express')()
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {origin : '*'}
});

userList = []
privateRooms = []
const port = 8080;

online_user = []

io.on('connection' , (socket)=>{
    console.log('user connected');

    // io.emit('ID', socket.id)

    socket.on('join', function(data){
        // console.log(data,'join');

        const roomIndex  =  privateRooms.findIndex((room) => room === data)
        // console.log(roomIndex);
        const roomExist = roomIndex >-1
        if(!roomExist){
          privateRooms.push(data)
        }
        // console.log(privateRooms);

        socket.join(data)

        // console.log(data.user + " join the room " + data.room);

        socket.broadcast.to(data).emit('new user joined', {message:'has joined this room.'});
       
        // socket.emit(message.room).emit('new user joined', {user:message.user, message:'has joined this room.'})
      });

      socket.on('loggedIn', (data)=>{
        let user_index = online_user.findIndex(item => item.username == data.username)
        online_user.push({
          ...data,socket_id : socket.id
         })
        io.emit('UsersLogged' , online_user)
      })

      socket.on('chat',(data,my_detail)=>{
        // console.log(data,my_detail);
        if(data.type == 'group'){
          console.log(data,'chatdata');
          socket.join(data.username)
          socket.broadcast.to(data.username).emit('new user joined', {user : data.user_id , message:'has joined this room.'});
          io.emit('room_id',data.username)
        }else{
          console.log(data);
          let data1 = [data.username, my_detail.username];
          console.log(data1,'jcvjx');
          data1.sort();
          let room_id = "";
          for (let index = 0; index < data1.length; index++) {
            room_id = room_id + data1[index];
          }
          socket.join(room_id);
          io.emit("room_id", room_id);
        }
      })

      socket.on('leave', (message) => {
        console.log(message,'leave');

        console.log(message.user + " left the room");

        socket.leave(message.room)

        socket.broadcast.to(message.room).emit('User left', {user:message.user, message:'has left the group'});
        
        // io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
      });
      
     

      socket.on('send_message',(data)=>{
        console.log(data,'jqcvwycvqeucyu');
        io.in(data.room_id).emit("update_session_storage", data);
      })

     

    
      socket.on('disconnect', () => {
        console.log('a user disconnected!');
        let data = online_user.filter((data)=> data.socket_id == socket.id)
        console.log(data);
        
    
        online_user = online_user.filter((data)=> data.socket_id != socket.id)
        console.log(online_user,'adcjhvdhcvsdjh');
        io.emit('OnlineUsers' , online_user , data)
        // localStorage.clear()
        // console.log(online_user,'hhhhhhhhh');
        
      });
    
})  

httpServer.listen(port , ()=>{
    console.log(`port ${port}`);
})