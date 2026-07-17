const http = require("http");
const app = require("./app");


// =============================
// Database Setup
// =============================

// إنشاء الجداول
require("./database/tables");

// تحميل البيانات الافتراضية
// (الرتب + الغرف)
require("./database/defaultData");


// =============================
// Socket.IO
// =============================

const { Server } = require("socket.io");


const server = http.createServer(app);


const io = new Server(server, {

    cors: {
        origin: "*"
    }

});


// =============================
// Socket Events
// =============================

require("./socket/chatSocket")(io);

require("./socket/privateSocket")(io);


// =============================
// Server Start
// =============================

const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {

    console.log(
        `🚀 Chat Yemen Server Running On Port ${PORT}`
    );

});