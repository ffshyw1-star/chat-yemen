const db = require("./database");


db.serialize(() => {


// =========================
// المستخدمين
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS users (

id INTEGER PRIMARY KEY AUTOINCREMENT,

username TEXT UNIQUE NOT NULL,
password TEXT,

email TEXT,

gender TEXT,
age INTEGER,
country TEXT,

avatar TEXT DEFAULT 'default.png',
wall_image TEXT,

rank TEXT DEFAULT 'guest',

balance INTEGER DEFAULT 0,

status TEXT DEFAULT 'online',

last_seen DATETIME,

hidden_account INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// الرتب
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS ranks (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT UNIQUE,

level INTEGER,

permissions TEXT

)
`);


// =========================
// الغرف
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS rooms (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT,

icon TEXT,

description TEXT,

created_by INTEGER,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// مراقبي الغرف
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS room_staff (

id INTEGER PRIMARY KEY AUTOINCREMENT,

room_id INTEGER,

user_id INTEGER,

role TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// الرسائل العامة
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

room_id INTEGER,

user_id INTEGER,

message TEXT,

type TEXT DEFAULT 'text',

hidden INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// الرسائل الخاصة
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS private_messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

sender_id INTEGER,

receiver_id INTEGER,

message TEXT,

type TEXT DEFAULT 'text',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// الأصدقاء
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS friends (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

friend_id INTEGER,

status TEXT DEFAULT 'pending',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// الإشعارات ❤️
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS notifications (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

title TEXT,

content TEXT,

type TEXT,

is_read INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// إعجاب الملف الشخصي
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS profile_likes (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

liked_user INTEGER,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

UNIQUE(user_id,liked_user)

)
`);


// =========================
// أخبار الموقع
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS news (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

content TEXT,

image TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// تفاعلات الأخبار
// 👍 🚫 ❤️ 😂
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS news_reactions (

id INTEGER PRIMARY KEY AUTOINCREMENT,

news_id INTEGER,

user_id INTEGER,

reaction TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// تعليقات الأخبار
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS comments (

id INTEGER PRIMARY KEY AUTOINCREMENT,

news_id INTEGER,

user_id INTEGER,

comment TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// البلاغات 📭
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS reports (

id INTEGER PRIMARY KEY AUTOINCREMENT,

reporter_id INTEGER,

target_user INTEGER,

message_id INTEGER,

reason TEXT,

status TEXT DEFAULT 'new',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// العقوبات
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS punishments (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

admin_id INTEGER,

type TEXT,

reason TEXT,

duration INTEGER,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


// =========================
// إعدادات المستخدم
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS settings (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

theme TEXT DEFAULT 'light',

private_sound INTEGER DEFAULT 1,

public_sound INTEGER DEFAULT 1,

notification_sound INTEGER DEFAULT 1,

private_mode TEXT DEFAULT 'all'

)
`);


// =========================
// المتجر 🛒
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS store (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT,

type TEXT,

price INTEGER

)
`);


// =========================
// سجل الإدارة
// =========================

db.run(`
CREATE TABLE IF NOT EXISTS admin_logs (

id INTEGER PRIMARY KEY AUTOINCREMENT,

admin_id INTEGER,

target_user INTEGER,

action TEXT,

details TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`);


console.log("✅ All Database Tables Created");


});