const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // السماح بالاتصال من أي موقع ويب

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // استقبال الاتصالات من المتصفحات وهواتف الجوال
        methods: ["GET", "POST"]
    }
});

// تخزين الرسائل مؤقتاً في ذاكرة السيرفر لكل غرفة لحين تصفيرها
const roomHistory = {
    general: [],
    yemen: [],
    algeria: [],
    egypt: []
};

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل بالسيرفر:', socket.id);

    // 1. معالجة دخول المستخدم إلى غرفة محددة
    socket.on('join_room', (data) => {
        socket.join(data.room);
        
        // إرسال الأرشيف القديم للرسائل للمستخدم لكي يرى المحتوى فور دخوله
        socket.emit('load_history', roomHistory[data.room] || []);

        // بث رسالة النظام لجميع المتواجدين في الغرفة
        const welcomeText = `${data.username} انضم للغرفة [ رتبة ${data.roleAr} ]`;
        const sysMsg = { type: "system", text: welcomeText };
        
        roomHistory[data.room].push(sysMsg);
        io.to(data.room).emit('receive_message', sysMsg);
    });

    // 2. استقبال رسائل المستخدمين وبثها فوراً لأعضاء الغرفة
    socket.on('send_message', (data) => {
        const userMsg = {
            type: "user",
            username: data.username,
            gender: data.gender,
            text: data.text,
            role: data.role,
            time: data.time,
            avatar: data.avatar
        };

        if (roomHistory[data.room]) {
            roomHistory[data.room].push(userMsg);
            // حفظ آخر 60 رسالة فقط لتخفيف الضغط على السيرفر المجاني
            if (roomHistory[data.room].length > 60) roomHistory[data.room].shift();
        }

        io.to(data.room).emit('receive_message', userMsg);
    });

    // 3. أمر الطرد والحظر الصادر من رتب الإدارة
    socket.on('admin_kick', (data) => {
        const kickMsg = { type: "system", text: `[ تم حظر وطرد المستخدم ${data.targetUser} من السيرفر فوراً ]` };
        roomHistory[data.room].push(kickMsg);
        io.to(data.room).emit('receive_message', kickMsg);
        io.to(data.room).emit('user_banned', { username: data.targetUser });
    });

    // 4. أمر تصفير ومسح محادثات الغرفة من لوحة التحكم
    socket.on('clear_room', (data) => {
        if (roomHistory[data.room]) {
            roomHistory[data.room] = [];
            io.to(data.room).emit('room_cleared');
        }
    });

    socket.on('disconnect', () => {
        console.log('مستخدم قطع الاتصال:', socket.id);
    });
});

// تشغيل السيرفر على بورت 3000 أو البورت التلقائي للاستضافة المجانية
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`سيرفر شات اليمن المطور يعمل بنجاح على البورت ${PORT}`);
});
