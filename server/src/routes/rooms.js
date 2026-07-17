<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>
الغرف - شات اليمن المطور
</title>


<style>

*{
box-sizing:border-box;
}


body{

margin:0;

font-family:tahoma,Arial;

background:#f3f3f3;

}



.header{

background:#222;

color:white;

padding:15px;

text-align:center;

font-size:20px;

}



.rooms{

padding:15px;

}




.room{

background:white;

border-radius:15px;

padding:20px;

margin-bottom:15px;

text-align:center;

box-shadow:0 2px 8px #ccc;

}



.room-icon{

font-size:45px;

}



.room-name{

font-size:20px;

font-weight:bold;

margin:10px;

}



.online{

color:#777;

margin-bottom:10px;

}



button{

background:#2196f3;

color:white;

border:0;

padding:12px 25px;

border-radius:20px;

cursor:pointer;

font-size:15px;

}



.error{

text-align:center;

color:red;

padding:20px;

}


</style>


</head>


<body>



<div class="header">

🌎 شات اليمن المطور

</div>



<div class="rooms" id="rooms">


</div>





<script>


// التحقق من الدخول


const token =
localStorage.getItem("token");



if(!token){


location.href="index.html";


}





async function loadRooms(){


try{


let response =
await fetch("/api/rooms",{

method:"GET",

headers:{


"Authorization":

"Bearer " + token


}


});





if(response.status===401){


localStorage.clear();

location.href="index.html";

return;


}




let rooms =
await response.json();



let box =
document.getElementById(
"rooms"
);



box.innerHTML="";





rooms.forEach(room=>{


box.innerHTML +=

`

<div class="room">


<div class="room-icon">

${room.icon}

</div>



<div class="room-name">

${room.name}

</div>



<div class="online">

المتواجدين الآن: 0

</div>



<button onclick="joinRoom('${room.id}','${room.name}')">

اضغط هنا للدخول

</button>


</div>


`;



});



}

catch(error){


document.getElementById(
"rooms"
).innerHTML=

`

<div class="error">

حدث خطأ في تحميل الغرف

</div>

`;


console.log(error);


}



}





function joinRoom(id,name){


localStorage.setItem(
"room_id",
id
);



localStorage.setItem(
"room_name",
name
);



location.href=
"chat.html?room="+id;



}




loadRooms();


</script>


</body>

</html>