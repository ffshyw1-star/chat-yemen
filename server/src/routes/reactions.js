const express = require("express");

const auth =
require("../middleware/auth");

const db =
require("../database/database");


const router = express.Router();




// إضافة تفاعل للمنشور

router.post("/",auth,(req,res)=>{


const {

post_id,

reaction

}=req.body;



const user_id =
req.user.id;



const allowed = [

"👍",

"🚫",

"❤️",

"😂"

];



if(!allowed.includes(reaction)){


return res.status(400).json({

error:"تفاعل غير مسموح"

});


}





// منع تكرار نفس المستخدم

db.run(

`

DELETE FROM reactions

WHERE post_id=?

AND user_id=?

`,

[

post_id,

user_id

]

);





db.run(

`

INSERT INTO reactions

(

post_id,

user_id,

reaction

)

VALUES (?,?,?)

`,

[

post_id,

user_id,

reaction

],


(err)=>{


if(err){

return res.status(500).json({

error:"Database Error"

});

}



res.json({

message:"تم حفظ التفاعل"

});


}


);



});









// جلب التفاعلات


router.get("/:post_id",(req,res)=>{


db.all(

`

SELECT

reaction,

COUNT(*) AS count

FROM reactions

WHERE post_id=?

GROUP BY reaction

`,

[

req.params.post_id

],


(err,data)=>{


if(err){

return res.status(500).json({

error:"Database Error"

});

}



res.json(data);


}



);



});






module.exports = router;