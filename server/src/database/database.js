const sqlite3 = require("sqlite3").verbose();
const path = require("path");


// مكان حفظ قاعدة البيانات
const dbPath = path.join(__dirname, "../../chat.db");


// الاتصال بقاعدة البيانات
const db = new sqlite3.Database(dbPath, (err) => {

    if (err) {

        console.error("❌ Database Error:", err.message);

    } else {

        console.log("✅ Database Connected");

    }

});


// تفعيل العلاقات بين الجداول
db.run(`
PRAGMA foreign_keys = ON;
`);


// اختبار القاعدة
db.serialize(() => {

    console.log("🗄️ Database Ready");

});


module.exports = db;