module.exports = function(io){


const users = {};



io.on("connection",(socket)=>{


socket.on("register_user",(userId)=>{


socket.join(
"user_"+userId
);


});



});





return {


send(userId,message,type="system"){


io.to(
"user_"+userId
)
.emit(
"notification",
{

message,

type

}

);


}



};



};