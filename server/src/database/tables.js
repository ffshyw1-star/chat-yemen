const db = require("./database");


// =============================
// إنشاء جداول قاعدة البيانات
// =============================


db.serialize(()=>{



// جدول المستخدمين

db.run(`

CREATE TABLE IF NOT EXISTS users (

id INTEGER PRIMARY KEY AUTOINCREMENT,

username TEXT UNIQUE,

password TEXT,

email TEXT,

gender TEXT,

rank TEXT DEFAULT 'member',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);





// جدول الغرف

db.run(`

CREATE TABLE IF NOT EXISTS rooms (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT,

icon TEXT

)

`);





// جدول الرسائل العامة

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





// جدول الرسائل الخاصة

db.run(`

CREATE TABLE IF NOT EXISTS private_messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

sender_id INTEGER,

receiver_id INTEGER,

message TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);





// جدول الإشعارات

db.run(`

CREATE TABLE IF NOT EXISTS notifications (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

type TEXT,

message TEXT,

read INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);





// جدول الحظر

db.run(`

CREATE TABLE IF NOT EXISTS bans (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

reason TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);





// جدول سجل الإدارة

db.run(`

CREATE TABLE IF NOT EXISTS admin_logs (

id INTEGER PRIMARY KEY AUTOINCREMENT,

admin_id INTEGER,

target_id INTEGER,

action TEXT,

details TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);




console.log("✅ Database Tables Loaded");


});