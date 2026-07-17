const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// إنشاء مجلد قاعدة البيانات إذا لم يكن موجوداً
const databaseFolder = path.join(__dirname);

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

// مسار قاعدة البيانات
const databasePath = path.join(__dirname, "chat.db");

// الاتصال
const db = new Database(databasePath);

// تحسين الأداء
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");
db.pragma("temp_store = MEMORY");
db.pragma("cache_size = -64000");

// اختبار الاتصال
try {

    db.prepare("SELECT 1").get();

    console.log("✅ SQLite Connected");

} catch (err) {

    console.error("❌ Database Error");

    console.error(err);

}

module.exports = db;