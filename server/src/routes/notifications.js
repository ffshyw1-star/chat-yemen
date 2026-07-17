const express = require('express');
const router = express.Router();
const db = require("../database/database");

// جلب الإشعارات الخاصة بالمستخدم
router.get('/', (req, res) => {
    res.json({ success: true, notifications: [] });
});

module.exports = router;
