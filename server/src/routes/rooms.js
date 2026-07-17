const express = require("express");
const db = require("../database/database");

const router = express.Router();


// =============================
// عرض جميع الغرف
// =============================

router.get("/", (req,res)=>{


db.all(

`
SELECT 
id,
name,
icon

FROM rooms

ORDER BY id ASC
`,

[],

(err,rooms)=>{


if(err){

return res.status(500).json({
error:"Database Error"
});

}



res.json(rooms);



});


});




// =============================
// جلب غرفة معينة
// =============================

router.get("/:id",(req,res)=>{


const id =
req.params.id;



db.get(

`
SELECT *

FROM rooms

WHERE id=?

`,

[id],

(err,room)=>{


if(err){

return res.status(500).json({
error:"Database Error"
});

}



if(!room){

return res.status(404).json({
error:"Room Not Found"
});

}



res.json(room);



});


});





module.exports = router;