const db = require("./database");


// إضافة الرتب الافتراضية
function createRanks() {

    const ranks = [

        {
            name: "guest",
            level: 1,
            permissions: "chat,private,voice"
        },

        {
            name: "member",
            level: 2,
            permissions: "chat,private,voice,friends"
        },

        {
            name: "vip",
            level: 3,
            permissions: "chat,private,voice,image,youtube,custom"
        },

        {
            name: "moderator",
            level: 4,
            permissions: "mute,kick,delete_message"
        },

        {
            name: "manager",
            level: 5,
            permissions: "moderator,news,users"
        },

        {
            name: "admin",
            level: 6,
            permissions: "manager,logs,reports"
        },

        {
            name: "owner",
            level: 7,
            permissions: "all"
        }

    ];


    ranks.forEach(rank => {

        db.run(
        `
        INSERT OR IGNORE INTO ranks
        (name,level,permissions)

        VALUES (?,?,?)
        `,
        [
            rank.name,
            rank.level,
            rank.permissions
        ]);

    });

}



// إضافة الغرف الافتراضية
function createRooms(){

    const rooms = [

        {
            name:"🌎 الغرفة العامة",
            icon:"🌎"
        },

        {
            name:"🇾🇪 غرفة اليمن",
            icon:"🇾🇪"
        },

        {
            name:"🇩🇿 غرفة الجزائر",
            icon:"🇩🇿"
        },

        {
            name:"🇪🇬 غرفة مصر",
            icon:"🇪🇬"
        }

    ];


    rooms.forEach(room=>{


        db.run(

        `
        INSERT OR IGNORE INTO rooms
        (name,icon)

        VALUES (?,?)
        `,

        [
            room.name,
            room.icon
        ]

        );


    });


}



// تشغيل البيانات
db.serialize(()=>{

    createRanks();

    createRooms();


    console.log("✅ Default Data Loaded");

});