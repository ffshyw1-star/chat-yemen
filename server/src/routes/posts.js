const express = require("express");

const auth =
require("../middleware/auth");

const db =
require("../database/database");


const router = express.Router();




// جلب المنشورات

router.get("/",(req,res)=>{


db.all(

`

SELECT *

FROM posts

ORDER BY id DESC

`,

(err,data)=>{


if(err){

return res.status(500).json({

error:"Database Error"

});

}



res.json(data);


});


});







// إنشاء منشور

router.post("/",auth,(req,res)=>{


const content =
req.body.content;



db.run(

`

INSERT INTO posts

(
user_id,
username,
content
)

VALUES (?,?,?)

`,

[

req.user.id,

req.user.username,

content

],


(err)=>{


if(err){

return res.status(500).json({

error:"Database Error"

});

}



res.json({

message:"تم نشر المنشور"

});


});


});






module.exports = router;