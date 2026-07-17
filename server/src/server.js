const http = require("http");

const app = require("./app");


// تحميل جداول قاعدة البيانات

require("./database/tables");


// تحميل نظام الرتب والصلاحيات

require("./database/ranks");



const { Server } = require("socket.io");



const server = http.createServer(app);



const io = new Server(server,{

cors:{

origin:"*"

}

});




// Socket العامة

require("./socket/chatSocket")(io);


// Socket الخاص

require("./socket/privateSocket")(io);


// Socket المتواجدين

require("./socket/onlineSocket")(io);





const PORT =
process.env.PORT || 3000;



server.listen(PORT,()=>{


console.log(
`Chat Yemen Server Running ${PORT}`
);


});