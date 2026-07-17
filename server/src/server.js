const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");


// إنشاء السيرفر

const server = http.createServer(app);


// إعداد Socket.IO

const io = new Server(server, {

    cors: {
        origin: "*"
    }

});


// تشغيل أنظمة Socket

require("./socket/chatSocket")(io);

require("./socket/privateSocket")(io);

require("./socket/onlineSocket")(io);



// المنفذ

const PORT = process.env.PORT || 3000;


// تشغيل الموقع

server.listen(PORT, ()=>{

    console.log(`Chat Yemen Server Running ${PORT}`);

});