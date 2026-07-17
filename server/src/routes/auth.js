const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/database");

const router = express.Router();

const SECRET = "chat-yemen-secret";


// ==========================
// دخول الزوار
// ==========================

router.post("/guest", (req,res)=>{

    const {
        username,
        gender
    } = req.body;


    const age = Math.floor(
        Math.random() * (99 - 20 + 1)
    ) + 20;


    db.run(

    `
    INSERT INTO users
    (
    username,
    gender,
    age,
    rank
    )
    VALUES (?,?,?,'guest')
    `,

    [
        username,
        gender,
        age
    ],

    function(err){

        if(err){

            return res.json({
                error:"الاسم مستخدم"
            });

        }


        const token = jwt.sign(

        {
            id:this.lastID,
            rank:"guest"

        },

        SECRET

        );


        res.json({

            token,

            user:{
                id:this.lastID,
                username,
                gender,
                age,
                rank:"guest"
            }

        });


    });


});



// ==========================
// تسجيل عضو
// ==========================

router.post("/register", async(req,res)=>{


const {
username,
password,
email
}=req.body;


const hash = await bcrypt.hash(
password,
10
);


db.run(

`
INSERT INTO users
(
username,
password,
email,
rank
)

VALUES (?,?,?,'member')
`,

[
username,
hash,
email
],

function(err){


if(err){

return res.json({
error:"المستخدم موجود"
});

}


res.json({
message:"تم إنشاء الحساب"
});


});


});



// ==========================
// دخول عضو
// ==========================

router.post("/login",(req,res)=>{


const {
username,
password
}=req.body;



db.get(

`
SELECT * FROM users
WHERE username=?
`,

[
username
],

async(err,user)=>{


if(!user){

return res.json({
error:"المستخدم غير موجود"
});

}



const match =
await bcrypt.compare(
password,
user.password
);



if(!match){

return res.json({
error:"كلمة المرور خطأ"
});

}



const token = jwt.sign(

{
id:user.id,
rank:user.rank
},

SECRET

);



res.json({

token,

user

});


});


});


module.exports = router;