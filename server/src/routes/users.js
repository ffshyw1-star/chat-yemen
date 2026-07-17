const express = require('express');
const router = express.Router();
const db = require("../database/database");

// جلب قائمة المستخدمين أو الأعضاء المسجلين
router.get('/', (req, res) => {
    try {
        const users = db.prepare('SELECT id, name, rank FROM users LIMIT 50').all();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب الأعضاء" });
    }
});

module.exports = router;
