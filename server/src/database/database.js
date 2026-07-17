const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./chat.db",
(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Database Connected");
    }
});

module.exports = db;