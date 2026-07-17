const express = require("express");

const auth =
require("../middleware/auth");

const db =
require("../database/database");


const router = express.Router();





function checkPermission(user){


if(user.rank==="owner")
return true;


if(
user.rank==="admin" ||
user.rank==="superadmin" ||
user.rank==="moderator"
)

return true;



return false;


}







// 🔇 كتم


router.post("/mute",auth,(req,res)=>{


if(!checkPermission(req.user)){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}



const {

userId,

minutes,

room

}=req.body;



const adminSocket =
req.app.get(
"adminSocket"
);



if(adminSocket){

adminSocket.mute(
room,
userId,
minutes
);

}



res.json({

message:
`تم كتم المستخدم لمدة ${minutes} دقائق`

});


});








// 🚪 طرد


router.post("/kick",auth,(req,res)=>{


if(!checkPermission(req.user)){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}



const adminSocket =
req.app.get(
"adminSocket"
);



adminSocket.kick(

req.body.room,

req.body.userId

);




res.json({

message:"تم طرد المستخدم"

});


});








// 🗑 حذف رسالة


router.post("/delete-message",auth,(req,res)=>{


if(!checkPermission(req.user)){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}



const adminSocket =
req.app.get(
"adminSocket"
);



adminSocket.deleteMessage(
req.body.room
);



res.json({

message:"تم حذف رسالة مخالفة"

});


});










// ✏️ تعديل الاسم


router.post("/rename",auth,(req,res)=>{


if(!checkPermission(req.user)){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}



const adminSocket =
req.app.get(
"adminSocket"
);



adminSocket.rename(

req.body.room,

req.body.oldName,

req.body.newName

);



res.json({

message:"تم تغيير الاسم"

});


});










// 🚫 حظر


router.post("/ban",auth,(req,res)=>{


if(!checkPermission(req.user)){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}



res.json({

message:"تم حظر المستخدم"

});


});









// 📝 سجل العضو


router.get("/history/:id",auth,(req,res)=>{


res.json({

user:req.params.id,

history:[]

});


});









// 🗑 حذف عضوية (المالك فقط)


router.delete("/delete-user/:id",auth,(req,res)=>{


if(req.user.rank!=="owner"){

return res.status(403).json({

error:"للمالك فقط"

});

}



db.run(

`
DELETE FROM users
WHERE id=?
`,

[
req.params.id
]

);



res.json({

message:"تم حذف العضوية"

});


});









// تغيير الرتبة (المالك)


router.post("/rank",auth,(req,res)=>{


if(req.user.rank!=="owner"){

return res.status(403).json({

error:"للمالك فقط"

});

}



db.run(

`
UPDATE users
SET rank=?
WHERE id=?
`,

[

req.body.rank,

req.body.userId

]

);



res.json({

message:"تم تحديث الرتبة"

});


});







module.exports = router;