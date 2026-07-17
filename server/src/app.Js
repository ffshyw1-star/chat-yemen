const express = require("express");
const path = require("path");


const app = express();


// قراءة JSON

app.use(express.json());


// قراءة البيانات من النماذج

app.use(express.urlencoded({
    extended:true
}));




// الملفات العامة

app.use(
express.static(
path.join(__dirname,"../public")
)
);




// Routes

const authRoutes = require("./routes/authRoutes");

app.use(
"/api/auth",
authRoutes
);



const roomsRoutes = require("./routes/rooms");

app.use(
"/api/rooms",
roomsRoutes
);





// الصفحة الرئيسية

app.get("/",(req,res)=>{

res.sendFile(

path.join(
__dirname,
"../public/index.html"
)

);

});





// اختبار السيرفر

app.get("/api/test",(req,res)=>{

res.json({

status:"Chat Yemen API Running"

});

});





module.exports = app;