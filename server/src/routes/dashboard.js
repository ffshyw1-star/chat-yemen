const express = require('express');
const router = express.Router();
const db = require("../database/database");

// 1. إحصائيات الموقع الشاملة
router.get('/stats', (req, res) => {
    try {
        const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const roomsCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
        const messagesCount = db.prepare('SELECT COUNT(*) as count FROM messages').get()?.count || 0;
        const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts').get()?.count || 0;
        
        res.json({
            success: true,
            stats: {
                users: usersCount,
                online: 0, // يتم ربطه بـ Socket.io لاحقاً
                rooms: roomsCount,
                messages: messagesCount,
                posts: postsCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب الإحصائيات" });
    }
});

// 2. إدارة المستخدمين وتعديل الرتب
router.post('/users/role', express.json(), (req, res) => {
    const { target_user_id, new_rank } = req.body;
    try {
        const update = db.prepare('UPDATE users SET rank = ? WHERE id = ?');
        update.run(new_rank, target_user_id);
        
        // تسجيل العملية في السجلات (Logs)
        const log = db.prepare('INSERT INTO admin_logs (action, details) VALUES (?, ?)');
        log.run('CHANGE_RANK', `تم تغيير رتبة المستخدم ${target_user_id} إلى ${new_rank}`);
        
        res.json({ success: true, message: "تم تحديث الرتبة بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في تعديل الرتبة" });
    }
});

// 3. إنشاء الغرف وحذفها
router.post('/rooms', express.json(), (req, res) => {
    const { name, icon } = req.body;
    try {
        const insert = db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)');
        insert.run(name, icon);
        res.json({ success: true, message: "تم إنشاء الغرفة بنجax" });
    } catch (error) {
        res.status(500).json({ error: "فشل في إنشاء الغرفة" });
    }
});

router.delete('/rooms/:id', (req, res) => {
    const roomSubId = req.params.id;
    try {
        const del = db.prepare('DELETE FROM rooms WHERE id = ?');
        del.run(roomSubId);
        res.json({ success: true, message: "تم حذف الغرفة بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في حذف الغرفة" });
    }
});

// 4. إدارة الأخبار والإعلانات
router.post('/news', express.json(), (req, res) => {
    const { title, content } = req.body;
    try {
        // افترضنا وجود جدول باسم site_news
        const insert = db.prepare('INSERT INTO site_news (title, content, date) VALUES (?, ?, date("now"))');
        insert.run(title, content);
        res.json({ success: true, message: "تم نشر الخبر بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في نشر الخبر" });
    }
});

// 5. إعدادات الموقع والصيانة
router.put('/settings', express.json(), (req, res) => {
    const { site_name, maintenance_mode } = req.body;
    try {
        // تحديث جدول إعدادات الموقع الافتراضي site_settings
        const update = db.prepare('UPDATE site_settings SET value = ? WHERE key = "site_name"');
        update.run(site_name);
        res.json({ success: true, message: "تم حفظ إعدادات الموقع بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في تعديل الإعدادات" });
    }
});

// 6. مراجعة سجلات الإدارة (Logs)
router.get('/logs', (req, res) => {
    try {
        const logs = db.prepare('SELECT * FROM admin_logs ORDER BY id DESC LIMIT 100').all();
        res.json({ success: true, logs });
    } catch (error) {
        res.json({ success: true, logs: [] }); // تجنب التوقف إذا لم ينشأ الجدول بعد
    }
});

module.exports = router;
