const express = require("express");

const auth = require("../middleware/auth");

const db = require("../database/database");


const router = express.Router();




// فحص الصلاحية

function checkPermission(user,permission){


if(user.rank==="owner")
return true;



return false;


}





// 🔇 كتم مستخدم


router.post("/mute",auth,(req,res)=>{


const {

userId,

minutes

}=req.body;



if(!checkPermission(req.user,"mute")){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}




res.json({

message:
`تم كتم المستخدم لمدة ${minutes} دقيقة`

});


});








// 🚪 طرد مستخدم


router.post("/kick",auth,(req,res)=>{


if(!checkPermission(req.user,"kick")){

return res.status(403).json({

error:"ليس لديك صلاحية"

});

}



res.json({

message:"تم طرد المستخدم"

});


});







// 🗑 حذف رسالة


router.post("/delete-message",auth,(req,res)=>{


if(!checkPermission(req.user,"delete")){


return res.status(403).json({

error:"ليس لديك صلاحية"

});


}



res.json({

message:"تم حذف الرسالة"

});


});








// ✏️ تعديل الاسم


router.post("/rename",auth,(req,res)=>{


if(!checkPermission(req.user,"rename")){


return res.status(403).json({

error:"ليس لديك صلاحية"

});


}



res.json({

message:"تم تعديل الاسم"

});


});









// 🚫 حظر


router.post("/ban",auth,(req,res)=>{


if(!checkPermission(req.user,"ban")){


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









// 🗑 حذف عضوية (المالك)


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

[req.params.id]


);



res.json({

message:"تم حذف العضوية"

});


});









// ⬆️⬇️ تغيير الرتبة (المالك)


router.post("/rank",auth,(req,res)=>{


if(req.user.rank!=="owner"){


return res.status(403).json({

error:"للمالك فقط"

});


}



const {

userId,

rank

}=req.body;



db.run(

`

UPDATE users

SET rank=?

WHERE id=?

`,

[
rank,
userId
]

);



res.json({

message:"تم تحديث الرتبة"

});


});






module.exports = router;