const express = require('express');
const router = express.Router();

// مصفوفة الغرف الافتراضية لشات اليمن المطور
const defaultRooms = [
    { id: "1", name: "غرفة صنعاء العامة", icon: "🇾🇪" },
    { id: "2", name: "غرفة عدن الحبيبة", icon: "🌊" },
    { id: "3", name: "غرفة تعز العز", icon: "🏰" },
    { id: "4", name: "غرفة حضرموت الأصالة", icon: "🌴" }
];

// مسار جلب الغرف الذي تطلبه الواجهة عبر الـ fetch
router.get('/', (req, res) => {
    try {
        // يمكنك لاحقاً سحب الغرف من قاعدة بيانات SQLite هنا إذا أردت
        res.json(defaultRooms);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في السيرفر أثناء جلب الغرف" });
    }
});

module.exports = router;
