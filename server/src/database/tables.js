const db = require("./database");

// تشغيل جميع عمليات إنشاء الجداول داخل Transaction
db.exec(`
BEGIN TRANSACTION;

-- سيتم إضافة جميع الجداول هنا

COMMIT;
`);

console.log("✅ Database tables loaded.");

module.exports = db;