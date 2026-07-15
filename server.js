// تأكد من تثبيت المكتبات أولاً: npm install express socket.io cors
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // للسماح بالاتصال بين خادم الـ PHP وخادم الـ Node

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // يمكنك تحديده لاحقاً برابط موقعك فقط للأمان
        methods: ["GET", "POST"]
    }
});

// تخزين المستخدمين النشطين في الذاكرة
const activeUsers = {};

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل بالشات: ' + socket.id);

    // عند دخول المستخدم الشات وتحديد هويته والروم الخاص به
    socket.on('join_room', (data) => {
        socket.join(data.room_id);
        
        // حفظ بيانات الاتصال
        activeUsers[socket.id] = {
            username: data.username,
            role: data.role,
            room_id: data.room_id
        };

        // إرسال رسالة نظام للروم بتواجد مستخدم جديد
        io.to(data.room_id).emit('system_message', {
            text: `المشرف/النظام: دخل ${data.username} إلى الغرفة الآن.`
        });
    });

    // استقبال الرسائل العامة وتوزيعها فوراً
    socket.on('send_message', (data) => {
        const user = activeUsers[socket.id];
        if (user) {
            // نظام الاختصارات التلقائي (س1 -> السلام عليكم)
            let messageText = data.text;
            if(messageText === 'س1') messageText = 'السلام عليكم ورحمة الله وبركاته';
            if(messageText === 'تيت') messageText = 'برب دقيقة وراجع لكم (BRB)';

            const msgPayload = {
                username: user.username,
                role: user.role,
                text: messageText,
                time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
                is_private: false
            };

            // إرسال الرسالة لجميع من في هذه الغرفة فقط
            io.to(user.room_id).emit('receive_message', msgPayload);
        }
    });

    // عند قطع الاتصال (الخروج من المتصفح أو إغلاق النت)
    socket.on('disconnect', () => {
        const user = activeUsers[socket.id];
        if (user) {
            io.to(user.room_id).emit('system_message', {
                text: `خرج ${user.username} من الغرفة.`
            });
            delete activeUsers[socket.id];
        }
    });
});

// الشات يعمل على البورت 3000 بشكل منفصل
server.listen(3000, () => {
    console.log('سيرفر الـ Socket.IO يعمل بنجاح على البورت 3000');
});
