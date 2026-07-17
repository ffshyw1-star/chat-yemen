module.exports = function(io){


return {


mute:(room,user,minutes)=>{


io.to(
"room_"+room
)
.emit(
"system_message",
`تم كتم ${user} لمدة ${minutes} دقائق`
);



},





kick:(room,user)=>{


io.to(
"room_"+room
)
.emit(
"system_message",
`تم طرد ${user} من الغرفة`
);



},






rename:(room,oldName,newName)=>{


io.to(
"room_"+room
)
.emit(
"system_message",
`النظام تم تغير اسم المستخدم ${oldName} إلى ${newName}`
);



},





deleteMessage:(room)=>{


io.to(
"room_"+room
)
.emit(
"system_message",
"تم حذف رسالة مخالفة"
);



}



};



};