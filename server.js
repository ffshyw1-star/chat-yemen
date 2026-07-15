const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // السماح بالاتصال من أي موقع ويب

// تفعيل دمج وعرض ملفات الواجهة الأمامية من مجلد public
app.use(express.static(path.join(__dirname, 'public'))); 

// توجيه أي مسار HTTP رئيسي إلى صفحة الشات
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// تخزين الرسائل مؤقتاً في ذاكرة السيرفر
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
        
        // إرسال الأرشيف القديم للرسائل للمستخدم فور دخوله
        socket.emit('load_history', roomHistory[data.room] || []);

        // بث رسالة النظام لجميع المتواجدين في الغرفة
        const welcomeText = `${data.username} انضم للغرفة [ رتبة ${data.roleAr || 'زائر'} ]`;
        const sysMsg = { type: "system", text: welcomeText };
        
        if (roomHistory[data.room]) {
            roomHistory[data.room].push(sysMsg);
        }
        io.to(data.room).emit('receive_message', sysMsg);
    });

    // 2. استقبال رسائل المستخدمين وبثها فوراً لأعضاء الغرفة
    socket.on('send_message', (data) => {
        const userMsg = {
            type: "user",
            username: data.username,
            gender: data.gender,
            text: data.text,
            role: data.role || "guest", // استقبال الرتبة ديناميكياً (guest أو admin)
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

    // 3. أمر الطرد والحظر الصادر من الإدارة
    socket.on('admin_kick', (data) => {
        const kickMsg = { type: "system", text: `[ تم حظر وطرد المستخدم ${data.targetUser} من السيرفر فوراً ]` };
        if (roomHistory[data.room]) {
            roomHistory[data.room].push(kickMsg);
        }
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

// تشغيل السيرفر على بورت Render التلقائي أو 3000 محلياً
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`سيرفر شات اليمن المطور يعمل بنجاح على البورت ${PORT}`);
});
