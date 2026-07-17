module.exports = function(io){


io.on(
"connection",
(socket)=>{



// دخول الغرفة

socket.on(
"join_room",
(data)=>{


socket.join(
"room_"+data.room
);



socket.username =
data.username;


socket.room =
data.room;



io.to(
"room_"+data.room
)
.emit(
"system_message",
`دخل ${data.username} إلى الغرفة`
);



});







// إرسال رسالة

socket.on(
"send_message",
(data)=>{


io.to(
"room_"+data.room
)
.emit(
"receive_message",
{

username:data.username,

message:data.message,

time:new Date()
.toLocaleTimeString("ar")

}

);



});








// خروج

socket.on(
"disconnect",
()=>{


if(socket.username){


io.to(
"room_"+socket.room
)
.emit(
"system_message",
`غادر ${socket.username} الغرفة`
);



}



});



});



};