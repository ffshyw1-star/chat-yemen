const express = require('express');
const router = express.Router();
const db = require("../database/database");

// جلب قائمة الأصدقاء
router.get('/', (req, res) => {
    res.json({ success: true, friends: [] });
});

module.exports = router;
