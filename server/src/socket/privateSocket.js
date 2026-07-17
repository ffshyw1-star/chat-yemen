const db = require("../database/database");


module.exports = (io)=>{


io.on("connection",(socket)=>{


// تسجيل المستخدم الخاص

socket.on(
"private_register",
(userId)=>{


socket.userId = userId;


});




// فتح غرفة خاصة

socket.on(
"open_private",
(data)=>{


const {
userId,
targetId
}=data;



const room =

[userId,targetId]
.sort()
.join("_");



socket.join(
"private_"+room
);



});




// إرسال رسالة خاصة

socket.on(
"send_private_message",
(data)=>{


const {

senderId,
receiverId,
message

}=data;



const room =

[senderId,receiverId]
.sort()
.join("_");



const time =
new Date()
.toLocaleString(
"ar-EG",
{

hour:"2-digit",
minute:"2-digit",
day:"2-digit",
month:"2-digit"

});




// إرسال للطرفين فقط


io.to(
"private_"+room
)
.emit(
"receive_private_message",
{


senderId,

message,

time


});




// حفظ الرسالة

db.run(

`
INSERT INTO private_messages

(
sender_id,
receiver_id,
message,
created_at
)

VALUES (?,?,?,?)

`,

[

senderId,

receiverId,

message,

time

]

);



});




});



};