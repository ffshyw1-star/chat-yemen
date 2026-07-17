module.exports = (io)=>{

io.on("connection",(socket)=>{

console.log("User Connected",socket.id);


socket.on("join_room",(room)=>{

socket.join(room);

io.to(room).emit(
"system_message",
"انضم مستخدم جديد للغرفة"
);

});


socket.on("send_message",(data)=>{

io.to(data.room)
.emit(
"receive_message",
data
);

});


socket.on("disconnect",()=>{

console.log("User Disconnected");

});


});


};