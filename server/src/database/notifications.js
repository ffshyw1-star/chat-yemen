const express = require("express");

const auth =
require("../middleware/auth");

const db =
require("../database/database");


const router = express.Router();




// جلب إشعارات المستخدم

router.get("/",auth,(req,res)=>{


db.all(

`

SELECT *

FROM notifications

WHERE user_id=?

ORDER BY id DESC

`,

[
req.user.id
],

(err,data)=>{


res.json(
data || []
);


});


});







// تحديد كمقروء

router.post("/read/:id",auth,(req,res)=>{


db.run(

`

UPDATE notifications

SET read=1

WHERE id=?

`,

[
req.params.id
]


);



res.json({

message:"تم القراءة"

});


});





module.exports=router;