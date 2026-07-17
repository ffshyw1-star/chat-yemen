const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../database/database");

const router = express.Router();


const SECRET = "CHAT_YEMEN_SECRET";



// تسجيل حساب

router.post("/register",(req,res)=>{


const {
username,
password,
email,
gender
}=req.body;



if(!username || !password){

return res.status(400).json({

error:"بيانات ناقصة"

});

}



bcrypt.hash(
password,
10,
(err,hash)=>{


db.run(

`

INSERT INTO users

(
username,
password,
email,
gender
)

VALUES (?,?,?,?)

`,

[
username,
hash,
email,
gender
],


function(error){


if(error){

return res.status(400).json({

error:"اسم المستخدم موجود"

});

}



res.json({

message:"تم إنشاء الحساب"

});



});



});



});







// تسجيل الدخول

router.post("/login",(req,res)=>{


const {

username,

password

}=req.body;



db.get(

`

SELECT *

FROM users

WHERE username=?

`,

[username],

async(err,user)=>{


if(!user){

return res.status(404).json({

error:"المستخدم غير موجود"

});

}




const match =
await bcrypt.compare(
password,
user.password
);



if(!match){

return res.status(401).json({

error:"كلمة المرور خاطئة"

});

}




const token =
jwt.sign(

{

id:user.id,

username:user.username,

rank:user.rank

},

SECRET,

{

expiresIn:"30d"

}

);




res.json({

token,

user:{

id:user.id,

username:user.username,

rank:user.rank

}

});




});



});






// دخول زائر

router.post("/guest",(req,res)=>{


const {

username,

gender

}=req.body;



const token =
jwt.sign(

{

username,

gender,

guest:true

},

SECRET,

{

expiresIn:"1d"

}

);




res.json({

token,

user:{

username,

gender

}

});



});





module.exports=router;