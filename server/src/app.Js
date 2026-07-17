const express = require("express");
const path = require("path");


const app = express();


// Middleware

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));




// الملفات العامة

app.use(
express.static(
path.join(__dirname,"../public")
)
);




// =====================
// Routes
// =====================


// المصادقة

const authRoutes =
require("./routes/authRoutes");


app.use(
"/api/auth",
authRoutes
);





// الغرف

const roomsRoutes =
require("./routes/rooms");


app.use(
"/api/rooms",
roomsRoutes
);





// الإدارة

const adminRoutes =
require("./routes/admin");


app.use(
"/api/admin",
adminRoutes
);





// الإشعارات

const notificationRoutes =
require("./routes/notifications");


app.use(
"/api/notifications",
notificationRoutes
);





// نظام تفاعلات المنشورات

const reactionRoutes =
require("./routes/reactions");


app.use(
"/api/reactions",
reactionRoutes
);





// نظام المنشورات

const postsRoutes =
require("./routes/posts");


app.use(
"/api/posts",
postsRoutes
);







// اختبار السيرفر

app.get("/api/test",(req,res)=>{


res.json({

status:"Chat Yemen API Running"

});


});






// الصفحة الرئيسية

app.get("/",(req,res)=>{


res.sendFile(

path.join(
__dirname,
"../public/index.html"
)

);


});






module.exports = app;