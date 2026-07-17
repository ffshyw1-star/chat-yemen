module.exports=function(io){


return {


send(userId,message){


io.to(
"user_"+userId
)
.emit(
"notification",
{

message

}

);


}



};


};