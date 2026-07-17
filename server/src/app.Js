mconst express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.send("Chat Yemen Pro Server");
});

module.exports = app;