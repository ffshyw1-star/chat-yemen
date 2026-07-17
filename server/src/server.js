const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

require("./socket/chatSocket")(io);
require("./socket/privateSocket")(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{
    console.log(`Chat Yemen Server Running ${PORT}`);
});