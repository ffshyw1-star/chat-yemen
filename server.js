// تثبيت المكتبات المطلوبة: npm install express socket.io cors bcryptjs
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // لتشفير كلمات المرور بأمان

const app = express();
app.use(cors());
app.use(express.json()); // لقراءة البيانات القادمة بصيغة JSON

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ==========================================
// 🗄️ محاكاة قاعدة البيانات في ذاكرة السيرفر (In-Memory Database)
// ==========================================
const users = [];       // لتخزين الأعضاء المسجلين
const activeUsers = {}; // لتخزين المستخدمين المتصلين حالياً بالشات
const rooms = [         // الغرف الافتراضية للشات
    { id: "main", name: "الغرفة العامة الرئيسية", welcome: "مرحباً بك {name} في الملتقى العام لشباب اليمن" },
    { id: "sanaa", name: "روم صنعاء القديمة", welcome: "أهلاً بك يا {name} في روم عاصمة التاريخ والعراقة" },
    { id: "aden", name: "روم ثغر اليمن الباسم (عدن)", welcome: "يا مرحباً بنور العين {name} في روم عدن" }
];
const messageLogs = []; // أرشيف آخر الرسائل
const wordBlacklist = ["مسبّة1", "مسبّة2", "كلمة_بذيئة"]; // قائمة الكلمات المحظورة
const nameBlacklist = ["ادارة", "admin", "مدير", "المشرف", "شات_اليمن"]; // أسماء محظورة من التسجيل

// ==========================================
// 🔐 واجهة برمجة التطبيقات (API) للتسجيل والدخول عبر السيرفر
// ==========================================
app.post('/api/auth', async (req, res) => {
    const { action, username, password, age, gender } = req.body;

    if (!username || username.trim() === "") {
        return res.json({ success: false, message: "يرجى إدخال اسم مستخدم صالح." });
    }

    const cleanUsername = username.trim();

    // 1. فحص الأسماء المحظورة
    if (nameBlacklist.includes(cleanUsername.toLowerCase())) {
        return res.json({ success: false, message: "هذا الاسم محظور من قبل إدارة الشات." });
    }

    // --- حالة دخول زائر ---
    if (action === 'visitor') {
        // التحقق من أن الاسم غير محجوز لعضو مسجل
        const isRegistered = users.find(u => u.username === cleanUsername);
        if (isRegistered) {
            return res.json({ success: false, message: "هذا الاسم محجوز لعضو مسجل، يرجى اختيار اسم آخر أو تسجيل الدخول." });
        }
        
        return res.json({
            success: true,
            user: { username: cleanUsername, role: "زائر", age: age || 18, gender: gender || "ذكر" }
        });
    }

    // --- حالة تسجيل عضو جديد ---
    if (action === 'register') {
        const userExists = users.find(u => u.username === cleanUsername);
        if (userExists) {
            return res.json({ success: false, message: "اسم المستخدم هذا مسجل مسبقاً." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username: cleanUsername,
            password: hashedPassword,
            age: age || 18,
            gender: gender || "ذكر",
            role: "عضو"
        };
        users.push(newUser);

        return res.json({
            success: true,
            message: "تم التسجيل بنجاح!",
            user: { username: newUser.username, role: newUser.role, age: newUser.age, gender: newUser.gender }
        });
    }

    // --- حالة تسجيل دخول عضو مسجل ---
    if (action === 'login') {
        const user = users.find(u => u.username === cleanUsername);
        if (!user) {
            return res.json({ success: false, message: "اسم المستخدم غير موجود." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "كلمة المرور غير صحيحة." });
        }

        return res.json({
            success: true,
            user: { username: user.username, role: user.role, age: user.age, gender: user.gender }
        });
    }

    res.json({ success: false, message: "طلب غير معروف." });
});

// إرسال قائمة الغرف للفرونت إند
app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});


// ==========================================
// 💬 نظام الـ WebSockets (Socket.IO) للمحادثة الفورية
// ==========================================
io.on('connection', (socket) => {

    // عند انضمام المستخدم لغرفة شات
    socket.on('join_room', (data) => {
        socket.join(data.room_id);
        
        activeUsers[socket.id] = {
            username: data.username,
            role: data.role,
            room_id: data.room_id
        };

        const currentRoom = rooms.find(r => r.id === data.room_id);
        let welcomeText = currentRoom ? currentRoom.welcome.replace("{name}", data.username) : `أهلاً بك ${data.username}`;

        // إرسال رسالة ترحيبية خاصة بالمستخدم نفسه
        socket.emit('system_message', { text: welcomeText });

        // إشعار باقي المتواجدين في الروم بدخوله
        socket.to(data.room_id).emit('system_message', {
            text: `📢 دخل [${data.role}] ${data.username} إلى الغرفة الآن.`
        });
    });

    // استقبال وتوزيع الرسائل مع الفلترة والاختصارات
    socket.on('send_message', (data) => {
        const user = activeUsers[socket.id];
        if (user) {
            let messageText = data.text;

            // 1. فلترة الكلمات البذيئة تلقائياً
            wordBlacklist.forEach(badWord => {
                const regex = new RegExp(badWord, "g");
                messageText = messageText.replace(regex, "***");
            });

            // 2. نظام الاختصارات السريعة لـ شات اليمن
            if (messageText.trim() === 'س1') messageText = 'السلام عليكم ورحمة الله وبركاته 🌹';
            if (messageText.trim() === 'تيت') messageText = 'برب دقيقة وراجع لكم (BRB) 🕒';
            if (messageText.trim() === 'غ1') messageText = 'منورين الشات والرووم جميعاً يا غوالي ✨';

            const msgPayload = {
                username: user.username,
                role: user.role,
                text: messageText,
                time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
                room_id: user.room_id
            };

            // حفظ الرسالة في أرشيف السيرفر
            messageLogs.push(msgPayload);

            // بث الرسالة لكل المستخدمين داخل الغرفة المحددة
            io.to(user.room_id).emit('receive_message', msgPayload);
        }
    });

    // عند خروج المستخدم أو إغلاق المتصفح
    socket.on('disconnect', () => {
        const user = activeUsers[socket.id];
        if (user) {
            io.to(user.room_id).emit('system_message', {
                text: `🚶 خرج ${user.username} من الغرفة.`
            });
            delete activeUsers[socket.id];
        }
    });
});

// تشغيل السيرفر بالمنفذ المخصص من ريندر أو 3000 افتراضياً
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`سيرفر شات اليمن الاحترافي يعمل الآن على البورت ${PORT}`);
});
