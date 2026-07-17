const db = require("./database");


db.serialize(()=>{


db.run(`

CREATE TABLE IF NOT EXISTS ranks (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT UNIQUE,

level INTEGER,

permissions TEXT

)

`);




// إضافة الرتب الافتراضية


const ranks=[


[
"owner",
100,
"all"
],


[
"superadmin",
90,
"mute,kick,delete,ban"
],


[
"admin",
80,
"mute,kick,delete"
],


[
"moderator",
70,
"mute"
],


[
"vip",
50,
""
],


[
"member",
10,
""
],


[
"guest",
0,
""
]


];





ranks.forEach(rank=>{


db.run(

`

INSERT OR IGNORE INTO ranks

(
name,
level,
permissions
)

VALUES (?,?,?)

`,

rank


);


});



console.log(
"✅ Ranks Loaded"
);



});