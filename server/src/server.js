require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

// إنشاء الجداول عند تشغيل السيرفر
require("./database/tables");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.SOCKET_CORS || "*",
        methods: ["GET", "POST"]
    }
});

// جعل Socket.IO متاحاً داخل جميع Routes
app.set("io", io);

// =============================
// Socket Systems
// =============================

// الدردشة العامة
require("./socket/chatSocket")(io);

// الرسائل الخاصة
require("./socket/privateSocket")(io);

// المتصلون
require("./socket/onlineSocket")(io);

// الإشعارات
const notificationSocket =
require("./socket/notificationSocket")(io);

app.set(
    "notificationSocket",
    notificationSocket
);

// الإدارة
const adminSocket =
require("./socket/adminSocket")(io);

app.set(
    "adminSocket",
    adminSocket
);

// الغرف
require("./socket/roomSocket")(io);

// الأصدقاء
require("./socket/friendSocket")(io);

// لوحة الإحصائيات
require("./socket/dashboardSocket")(io);

// =============================

const PORT =
process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log("================================");

    console.log(
        `${process.env.SITE_NAME} Started`
    );

    console.log(
        `Running On Port ${PORT}`
    );

    console.log(
        `Mode : ${process.env.NODE_ENV}`
    );

    console.log("================================");

});