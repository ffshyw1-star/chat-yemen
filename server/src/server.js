const http = require("http");

const app = require("./app");


// تحميل جداول قاعدة البيانات

require("./database/tables");


// تحميل نظام الرتب (إذا كان الملف موجود)

require("./database/ranks");



const { Server } = require("socket.io");



const server = http.createServer(app);



const io = new Server(server, {

    cors: {

        origin: "*"

    }

});




// =====================
// Socket Systems
// =====================


// الدردشة العامة

require("./socket/chatSocket")(io);




// الرسائل الخاصة

require("./socket/privateSocket")(io);




// قائمة المتواجدين

require("./socket/onlineSocket")(io);




// نظام الإدارة

const adminSocket =
require("./socket/adminSocket")(io);



app.set(
    "adminSocket",
    adminSocket
);




// نظام الإشعارات

const notificationSocket =
require("./socket/notificationSocket")(io);



app.set(
    "notificationSocket",
    notificationSocket
);





// =====================
// تشغيل السيرفر
// =====================


const PORT =
process.env.PORT || 3000;



server.listen(PORT,()=>{


console.log(
`Chat Yemen Server Running ${PORT}`
);


});