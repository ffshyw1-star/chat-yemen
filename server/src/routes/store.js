const express = require('express');
const router = express.Router();
const db = require("../database/database");

// 1. جلب العناصر المتاحة في المتجر (GET /api/store)
router.get('/', (req, res) => {
    try {
        const items = db.prepare('SELECT * FROM store_items').all();
        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب عناصر المتجر" });
    }
});

// 2. إنشاء طلب شراء جديد (POST /api/store/order)
router.post('/order', express.json(), (req, res) => {
    const userId = req.user?.id || 1; // جلب المعرف من الـ Auth middleware لاحقاً
    const { item_id, quantity } = req.body;
    try {
        const insert = db.prepare('INSERT INTO orders (user_id, item_id, quantity, status) VALUES (?, ?, ?, "pending")');
        const result = insert.run(userId, item_id, quantity || 1);
        res.json({ success: true, orderId: result.lastInsertRowId, message: "تم إرسال طلب الشراء بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في إنشاء طلب الشراء" });
    }
});

// 3. جلب جميع الطلبات للإدارة أو للمستخدم (GET /api/orders)
router.get('/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders').all();
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب الطلبات" });
    }
});

// 4. الموافقة على الطلب (POST /api/orders/approve)
router.post('/orders/approve', express.json(), (req, res) => {
    const { order_id } = req.body;
    try {
        const update = db.prepare('UPDATE orders SET status = "approved" WHERE id = ?');
        update.run(order_id);
        res.json({ success: true, message: "تمت الموافقة على الطلب بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في تحديث حالة الطلب" });
    }
});

// 5. رفض الطلب (POST /api/orders/reject)
router.post('/orders/reject', express.json(), (req, res) => {
    const { order_id } = req.body;
    try {
        const update = db.prepare('UPDATE orders SET status = "rejected" WHERE id = ?');
        update.run(order_id);
        res.json({ success: true, message: "تم رفض الطلب" });
    } catch (error) {
        res.status(500).json({ error: "فشل في تحديث حالة الطلب" });
    }
});

// 6. جلب بيانات الاشتراكات والعضويات (GET /api/memberships)
router.get('/memberships', (req, res) => {
    try {
        const memberships = db.prepare('SELECT * FROM memberships').all();
        res.json({ success: true, memberships });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب الاشتراكات" });
    }
});

// 7. تمديد فترة الاشتراك أو العضوية (POST /api/memberships/extend)
router.post('/memberships/extend', express.json(), (req, res) => {
    const { membership_id, days } = req.body;
    try {
        const update = db.prepare('UPDATE memberships SET end_date = date(end_date, ?) WHERE id = ?');
        update.run(`+${days || 30} days`, membership_id);
        res.json({ success: true, message: "تم تمديد الاشتراك بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "فشل في تمديد الاشتراك" });
    }
});

module.exports = router;
