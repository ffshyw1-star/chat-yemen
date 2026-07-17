const db = require("./database");


// إنشاء الجداول

db.serialize(()=>{


// المستخدمين

db.run(`

CREATE TABLE IF NOT EXISTS users (

id INTEGER PRIMARY KEY AUTOINCREMENT,

username TEXT UNIQUE,

password TEXT,

email TEXT,

gender TEXT,

age INTEGER,

country TEXT,

avatar TEXT DEFAULT 'default.png',

wall_image TEXT,

rank TEXT DEFAULT 'guest',

balance INTEGER DEFAULT 0,

status TEXT,

last_seen TEXT,

private_setting TEXT DEFAULT 'all',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);





// الغرف

db.run(`

CREATE TABLE IF NOT EXISTS rooms (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT,

icon TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);





// الرسائل العامة

db.run(`

CREATE TABLE IF NOT EXISTS messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

room_id INTEGER,

user_id INTEGER,

username TEXT,

message TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);






// الرسائل الخاصة

db.run(`

CREATE TABLE IF NOT EXISTS private_messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

sender_id INTEGER,

receiver_id INTEGER,

message TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);







// الأصدقاء

db.run(`

CREATE TABLE IF NOT EXISTS friends (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

friend_id INTEGER,

status TEXT DEFAULT 'pending',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);








// إعجاب الملف الشخصي

db.run(`

CREATE TABLE IF NOT EXISTS profile_likes (

id INTEGER PRIMARY KEY AUTOINCREMENT,

from_user INTEGER,

to_user INTEGER,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

UNIQUE(from_user,to_user)

)

`);







// إعجابات الأخبار والمنشورات

db.run(`

CREATE TABLE IF NOT EXISTS post_reactions (

id INTEGER PRIMARY KEY AUTOINCREMENT,

post_id INTEGER,

user_id INTEGER,

reaction TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);







// البلاغات

db.run(`

CREATE TABLE IF NOT EXISTS reports (

id INTEGER PRIMARY KEY AUTOINCREMENT,

reporter_id INTEGER,

reported_user INTEGER,

message TEXT,

reason TEXT,

status TEXT DEFAULT 'new',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);







// الرتب

db.run(`

CREATE TABLE IF NOT EXISTS ranks (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT UNIQUE,

level INTEGER,

permissions TEXT

)

`);







// الكتم

db.run(`

CREATE TABLE IF NOT EXISTS mutes (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

room_id INTEGER,

minutes INTEGER,

reason TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);







// الطرد

db.run(`

CREATE TABLE IF NOT EXISTS kicks (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

room_id INTEGER,

reason TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);







// الإشعارات

db.run(`

CREATE TABLE IF NOT EXISTS notifications (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

type TEXT,

content TEXT,

read INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);







// إعدادات الغرف

db.run(`

CREATE TABLE IF NOT EXISTS room_settings (

id INTEGER PRIMARY KEY AUTOINCREMENT,

room_id INTEGER,

owner_id INTEGER,

settings TEXT

)

`);


// إضافة الغرف الأساسية

db.get(
"SELECT COUNT(*) as count FROM rooms",
[],
(err,row)=>{

if(row.count === 0){


db.run(`
INSERT INTO rooms
(name,icon)

VALUES

('🌎 الغرفة العامة','🌎'),

('🇾🇪 غرفة اليمن','🇾🇪'),

('🇩🇿 غرفة الجزائر','🇩🇿'),

('🇪🇬 غرفة مصر','🇪🇬')

`);


console.log("✅ Default Rooms Added");


}


});
// المستخدمون المتواجدون

db.run(`

CREATE TABLE IF NOT EXISTS online_users (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

username TEXT,

room_id INTEGER,

rank TEXT DEFAULT 'guest',

gender TEXT,

avatar TEXT,

joined_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);

console.log("✅ All Database Tables Created");


});