const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// ذاكرة الحفظ السريع البديلة عن MySQL لسرعة استجابة السيرفر المجاني
const users = [];       
const activeUsers = {}; 
const rooms = [         
    { id: "main", name: "الغرفة العامة الرئيسية", welcome: "مرحباً بك {name} في الملتقى العام لشباب اليمن" },
    { id: "sanaa", name: "روم صنعاء القديمة", welcome: "أهلاً بك يا {name} في روم عاصمة التاريخ والعراقة" },
    { id: "aden", name: "روم ثغر اليمن الباسم (عدن)", welcome: "يا مرحباً بنور العين {name} في روم عدن" }
];
const wordBlacklist = ["مسبّة1", "مسبّة2"]; 
const nameBlacklist = ["ادارة", "admin", "مدير", "مشرف"]; 

// API للتوثيق والتسجيل والدخول السريع بدون تفرع صفحات
app.post('/api/auth', async (req, res) => {
    const { action, username, password, age, gender } = req.body;
    if (!username || username.trim() === "") return res.json({ success: false, message: "الاسم غير صالح." });
    const cleanUsername = username.trim();

    if (nameBlacklist.includes(cleanUsername.toLowerCase())) {
        return res.json({ success: false, message: "هذا الاسم محظور من قبل الإدارة." });
    }

    if (action === 'visitor') {
        const isRegistered = users.find(u => u.username === cleanUsername);
        if (isRegistered) return res.json({ success: false, message: "الاسم محجوز لعضو مسجل." });
        return res.json({ success: true, user: { username: cleanUsername, role: "زائر", age: age || 18, gender: gender || "ذكر" } });
    }

    if (action === 'register') {
        const userExists = users.find(u => u.username === cleanUsername);
        if (userExists) return res.json({ success: false, message: "الاسم مسجل مسبقاً لمستخدم آخر." });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username: cleanUsername, password: hashedPassword, age: age || 18, gender: gender || "ذكر", role: "عضو" };
        users.push(newUser);
        return res.json({ success: true, user: { username: newUser.username, role: newUser.role } });
    }

    if (action === 'login') {
        const user = users.find(u => u.username === cleanUsername);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({ success: false, message: "بيانات الدخول المدخلة خاطئة." });
        }
        return res.json({ success: true, user: { username: user.username, role: user.role } });
    }
});

app.get('/api/rooms', (req, res) => res.json(rooms));

// اتصالات الـ WebSockets وإدارة الـ Real-time
io.on('connection', (socket) => {

    socket.on('join_room', (data) => {
        socket.join(data.room_id);
        
        activeUsers[socket.id] = {
            id: socket.id,
            username: data.username,
            role: data.role,
            room_id: data.room_id
        };

        // بث التحديث لقائمة الأعضاء النشطين أونلاين
        io.emit('update_users_list', Object.values(activeUsers));

        const currentRoom = rooms.find(r => r.id === data.room_id);
        let welcomeText = currentRoom ? currentRoom.welcome.replace("{name}", data.username) : `أهلاً بك ${data.username}`;
        socket.emit('system_message', { text: welcomeText });
        socket.to(data.room_id).emit('system_message', { text: `📢 دخل [${data.role}] ${data.username} إلى الغرفة.` });
    });

    // إرسال وتوزيع الرسائل العامة للغرف
    socket.on('send_message', (data) => {
        const user = activeUsers[socket.id];
        if (user) {
            let messageText = data.text;
            wordBlacklist.forEach(badWord => { messageText = messageText.replace(new RegExp(badWord, "g"), "***"); });

            // نظام اختصارات الكلمات التلقائي لشات اليمن
            if (messageText.trim() === 'س1') messageText = 'السلام عليكم ورحمة الله وبركاته 🌹';
            if (messageText.trim() === 'تيت') messageText = 'برب دقيقة وراجع لكم (BRB) 🕒';
            if (messageText.trim() === 'غ1') messageText = 'منورين الشات والرووم جميعاً يا غوالي ✨';

            io.to(user.room_id).emit('receive_message', {
                username: user.username,
                role: user.role,
                text: messageText,
                time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
                room_id: user.room_id
            });
        }
    });

    // معالجة ونقل الرسائل الخاصة بين الطرفين فوراً بدون حفظ خارجي
    socket.on('send_private_message', (data) => {
        const sender = activeUsers[socket.id];
        const targetSocketId = data.to_user_id;

        if (sender && activeUsers[targetSocketId]) {
            const privatePayload = {
                from_id: socket.id,
                from_username: sender.username,
                text: data.text,
                time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
            };
            
            io.to(targetSocketId).emit('receive_private_message', privatePayload);
            socket.emit('receive_private_message', privatePayload);
        }
    });

    socket.on('disconnect', () => {
        const user = activeUsers[socket.id];
        if (user) {
            socket.to(user.room_id).emit('system_message', { text: `🚶 خرج ${user.username} من الغرفة.` });
            delete activeUsers[socket.id];
            io.emit('update_users_list', Object.values(activeUsers));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`سيرفر شات اليمن المطور يعمل بنجاح على بورت آمن.`));
