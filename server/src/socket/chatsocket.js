const db = require("../database/database");


module.exports = (io)=>{


io.on("connection",(socket)=>{


console.log("User Connected:",socket.id);



// دخول غرفة

socket.on(
"join_room",
(data)=>{


const roomId =
data.room;


const username =
data.username;



socket.join(
"room_"+roomId
);



socket.username =
username;

socket.room =
roomId;



// رسالة النظام

io.to("room_"+roomId)
.emit(
"system_message",

`انضم ${username} إلى الغرفة`

);



});




// إرسال رسالة

socket.on(
"send_message",
(data)=>{


const {
room,
username,
message
}=data;



const time =
new Date()
.toLocaleString(
"ar-EG",
{
hour:"2-digit",
minute:"2-digit",
day:"2-digit",
month:"2-digit"
}
);



// إرسال للجميع

io.to(
"room_"+room
)
.emit(
"receive_message",
{

username,

message,

time

}

);



});





// خروج المستخدم

socket.on(
"disconnect",
()=>{


if(socket.room && socket.username){


io.to(
"room_"+socket.room
)
.emit(

"system_message",

`غادر ${socket.username}`

);


}



});



});


};