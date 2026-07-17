const db = require("./database");

// تشغيل جميع عمليات إنشاء الجداول داخل Transaction
db.exec(`
BEGIN TRANSACTION;

-- سيتم إضافة جميع الجداول هنا

COMMIT;
`);

console.log("✅ Database tables loaded.");

module.exports = db;
const db = require("./database");

db.exec(`

BEGIN TRANSACTION;

-- =====================================================
-- جدول المستخدمين
-- =====================================================

CREATE TABLE IF NOT EXISTS users (

id INTEGER PRIMARY KEY AUTOINCREMENT,

username TEXT UNIQUE NOT NULL,

password TEXT,

email TEXT,

gender TEXT,

age INTEGER,

role TEXT DEFAULT 'member',

avatar TEXT DEFAULT '/images/default-avatar.png',

cover TEXT DEFAULT '/images/default-cover.jpg',

bio TEXT DEFAULT '',

country TEXT DEFAULT '',

likes INTEGER DEFAULT 0,

friends INTEGER DEFAULT 0,

balance INTEGER DEFAULT 0,

points INTEGER DEFAULT 0,

online INTEGER DEFAULT 0,

last_seen DATETIME,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- جدول الغرف
-- =====================================================

CREATE TABLE IF NOT EXISTS rooms (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT NOT NULL,

icon TEXT DEFAULT '🌎',

description TEXT DEFAULT '',

owner_id INTEGER,

locked INTEGER DEFAULT 0,

max_users INTEGER DEFAULT 500,

welcome_message TEXT DEFAULT '',

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY(owner_id) REFERENCES users(id)

);

-- =====================================================
-- جدول الرسائل العامة
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

room_id INTEGER NOT NULL,

user_id INTEGER NOT NULL,

username TEXT,

message TEXT,

type TEXT DEFAULT 'text',

image TEXT,

deleted INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY(room_id) REFERENCES rooms(id),

FOREIGN KEY(user_id) REFERENCES users(id)

);

-- =====================================================
-- جدول الرسائل الخاصة
-- =====================================================

CREATE TABLE IF NOT EXISTS private_messages (

id INTEGER PRIMARY KEY AUTOINCREMENT,

sender_id INTEGER NOT NULL,

receiver_id INTEGER NOT NULL,

message TEXT,

type TEXT DEFAULT 'text',

image TEXT,

seen INTEGER DEFAULT 0,

deleted INTEGER DEFAULT 0,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY(sender_id) REFERENCES users(id),

FOREIGN KEY(receiver_id) REFERENCES users(id)

);

COMMIT;

`);

console.log("✅ Base tables created.");

module.exports = db;