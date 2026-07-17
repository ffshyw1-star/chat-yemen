const express = require('express');
const router = express.Router();
// تأكد من مسار قاعدة البيانات الصحيح في مشروعك
const db =
require("../database/database");

// 1. جلب بيانات الملف الشخصي للمستخدم الحالي
router.get('/me', (req, res) => {
    // req.user.id يتم جلبها عادة من middleware التحقق (Auth)
    const userId = req.user?.id || 1; 
    try {
        const userProfile = db.prepare('SELECT id, name, rank, age, country, bio, avatar, cover, likes, friends, last_seen FROM users WHERE id = ?').get(userId);
        if (!userProfile) return res.status(404).json({ error: "المستخدم غير موجود" });
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في السيرفر" });
    }
});

// 2. جلب بيانات ملف شخصي معين عن طريق الـ ID
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    try {
        const userProfile = db.prepare('SELECT id, name, rank, age, country, bio, avatar, cover, likes, friends, last_seen FROM users WHERE id = ?').get(userId);
        if (!userProfile) return res.status(404).json({ error: "المستخدم غير موجود" });
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في السيرفر" });
    }
});

// 3. تحديث بيانات الملف الشخصي (الاسم، العمر، الدولة، النبذة)
router.put('/', (express.json()), (req, res) => {
    const userId = req.user?.id || 1;
    const { name, age, country, bio } = req.body;
    try {
        const update = db.prepare('UPDATE users SET name = ?, age = ?, country = ?, bio = ? WHERE id = ?');
        update.run(name, age, country, bio, userId);
        res.json({ success: true, message: "تم تحديث الملف الشخصي بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل تحديث البيانات" });
    }
});

// 4. رفع الصورة الشخصية (Avatar)
router.post('/avatar', (req, res) => {
    // هنا يتم دمج مكتبة multer لاحقاً لرفع الملفات إلى server/uploads/avatars/
    res.json({ success: true, message: "تم رفع الصورة الشخصية بنجاح" });
});

// 5. رفع صورة الغلاف (Cover)
router.post('/cover', (req, res) => {
    // هنا يتم دمج مكتبة multer لاحقاً لرفع الملفات إلى server/uploads/covers/
    res.json({ success: true, message: "تم رفع صورة الغلاف بنجاح" });
});

module.exports = router;
