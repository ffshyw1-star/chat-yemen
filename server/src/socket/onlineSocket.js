const onlineUsers = {};


module.exports = (io)=>{


io.on("connection",(socket)=>{


socket.on("join_room",(data)=>{


const {
room,
username,
rank="guest",
gender,
avatar
}=data;



socket.room = room;
socket.username = username;



if(!onlineUsers[room]){

onlineUsers[room]=[];

}



onlineUsers[room].push({

id:socket.id,

username,

rank,

gender,

avatar

});




// إرسال قائمة المتواجدين

io.to("room_"+room)
.emit(

"online_users",

onlineUsers[room]

);




// رسالة دخول

io.to("room_"+room)
.emit(

"system_message",

`انضم ${username} إلى الغرفة`

);



});





socket.on("disconnect",()=>{


let room =
socket.room;



if(room && onlineUsers[room]){


onlineUsers[room] =
onlineUsers[room].filter(
u=>u.id!==socket.id
);



io.to("room_"+room)
.emit(

"online_users",

onlineUsers[room]

);



if(socket.username){


io.to("room_"+room)
.emit(

"system_message",

`غادر ${socket.username}`

);


}


}



});



});


};