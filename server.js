// استيراد الحزم الضرورية
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// إنشاء تطبيق Express وخادم HTTP
const app = express();
const server = http.createServer(app);

// إعداد Socket.IO مع السماح بالـ CORS من جميع المصادر
const io = new Server(server, { 
  cors: { origin: "*" }, 
  trustProxy: true 
});

// إعدادات Middleware
app.use(cors());
app.use(express.static('public'));              // ملفات ثابتة من مجلد public
app.use('/uploads', express.static('uploads')); // ملفات المرفقات (صور، صوتيات)

// إنشاء مجلدات إذا لم تكن موجودة
const ensureDirExists = dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
ensureDirExists('./uploads');
ensureDirExists('./data');

// ملفات تخزين البيانات
const DATA_DIR = './data';
const BANS_FILE = path.join(DATA_DIR, 'bans.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const MUTED_FILE = path.join(DATA_DIR, 'muted.json');
const MAX_MESSAGES = 100;

// دوال تحميل وحفظ ملفات JSON
const loadJSON = (file, defaultData = {}) => {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : defaultData;
  } catch (err) {
    console.error(`خطأ في قراءة الملف ${file}:`, err);
    return defaultData;
  }
};
const saveJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`خطأ في حفظ الملف ${file}:`, err);
  }
};

// تحميل بيانات الحظر، المحادثات، وكتم الصوت
let bannedIPs = loadJSON(BANS_FILE);
let chatHistory = loadJSON(MESSAGES_FILE, { 'عام': [], 'تعارف': [], 'اليمن': [], 'فلة': [] });
let globalMuted = loadJSON(MUTED_FILE, []);

// إدارة المستخدمين والغرف
let users = {};  // تخزين بيانات المستخدمين حسب socket.id
let rooms = { 'عام': [], 'تعارف': [], 'اليمن': [], 'فلة': [] };

// قائمة الإداريين (أسماء حساسة)
const ADMINS = ['admin', 'مدير'];

// دالة الحصول على IP المستخدم من Socket
const getIP = socket => {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0].trim() : socket.handshake.address;
};

// دوال حفظ البيانات
const saveBans = () => saveJSON(BANS_FILE, bannedIPs);
const saveMuted = () => saveJSON(MUTED_FILE, globalMuted);
const saveMessages = () => saveJSON(MESSAGES_FILE, chatHistory);

// دالة حفظ رسالة جديدة في غرفة معينة مع الحد الأقصى للرسائل
const saveMessage = (room, msg) => {
  chatHistory[room] = chatHistory[room] || [];
  chatHistory[room].push(msg);
  if (chatHistory[room].length > MAX_MESSAGES) chatHistory[room].shift();
  saveMessages();
};

// إعداد تخزين الملفات للصور والصوتيات باستخدام multer
const imgStorage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'img_' + Date.now() + ext);
  }
});
const audioStorage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'audio_' + Date.now() + '.webm');
  }
});

// نقاط نهاية رفع الصور والصوتيات
app.post('/upload', multer({ storage: imgStorage }).single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع صورة' });
  res.json({ url: '/uploads/' + req.file.filename });
});
app.post('/upload-audio', multer({ storage: audioStorage }).single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع ملف صوتي' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// معالجة اتصالات Socket.IO
io.on('connection', (socket) => {
  const ip = getIP(socket);

  // التحقق من الحظر
  if (bannedIPs[ip] && (bannedIPs[ip].expire === null || bannedIPs[ip].expire > Date.now())) {
    socket.emit('banned', `انت محظور: ${bannedIPs[ip].reason}`);
    return socket.disconnect(true);
  } 
  // إزالة الحظر إذا انتهى
  else if (bannedIPs[ip]) {
    delete bannedIPs[ip];
    saveBans();
  }

  // حدث انضمام مستخدم جديد
  socket.on('join', (userData) => {
    // التحقق من اسم المستخدم
    if (!userData.name) return socket.emit('error', 'اسم المستخدم مطلوب');

    const isAdmin = ADMINS.includes(userData.name.toLowerCase());
    users[socket.id] = {
      ...userData,
      id: socket.id,
      room: 'عام',
      isAdmin,
      ip
    };

    socket.join('عام');
    rooms['عام'].push(socket.id);

    // إعلام باقي المستخدمين بغرفة "عام" بانضمام المستخدم الجديد
    io.to('عام').emit('user joined', users[socket.id]);

    // إرسال قائمة المستخدمين الحالية وغرفة المستخدم والتاريخ
    socket.emit('users list', rooms['عام'].map(id => users[id]));
    socket.emit('you are', { id: socket.id, isAdmin });
    socket.emit('chat history', chatHistory['عام'] || []);

    // إعلام المستخدم إذا كان مكتوم الصوت
    if (globalMuted.includes(socket.id)) socket.emit('you muted', true);
  });

  // حدث تغيير الغرفة
  socket.on('joinRoom', (roomName) => {
    const user = users[socket.id];
    if (!user || !rooms[roomName]) return;

    // الخروج من الغرفة القديمة
    socket.leave(user.room);
    rooms[user.room] = rooms[user.room].filter(id => id !== socket.id);
    io.to(user.room).emit('user left', user.name);

    // الانضمام للغرفة الجديدة
    user.room = roomName;
    socket.join(roomName);
    rooms[roomName].push(socket.id);
    io.to(roomName).emit('user joined', user);

    // إرسال قائمة المستخدمين والتاريخ لغرفة جديدة
    socket.emit('users list', rooms[roomName].map(id => users[id]));
    socket.emit('chat history', chatHistory[roomName] || []);
  });

  // استقبال رسالة جديدة
  socket.on('message', (data) => {
    const user = users[socket.id];
    if (!user) return;

    // تجاهل إذا كان المستخدم مكتوم الصوت
    if (globalMuted.includes(socket.id)) return;

    // بناء هيكل الرسالة
    const msg = {
      id: Date.now(),
      type: data.type,
      content: data.content,
      user: {
        name: user.name,
        gender: user.gender,
        id: user.id
      },
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      room: user.room
    };

    // حفظ الرسالة وتوزيعها على الغرفة
    saveMessage(user.room, msg);
    io.to(user.room).emit('message', msg);
  });

  // التعامل مع قطع الاتصال
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;

    // إزالة المستخدم من الغرفة والقائمة
    rooms[user.room] = rooms[user.room].filter(id => id !== socket.id);
    io.to(user.room).emit('user left', user.name);

    delete users[socket.id];
  });

  // المزيد من الأحداث مثل كتم الصوت، الحظر، الرسائل الخاصة يمكن إضافتها هنا...
});

// بدء الخادم على المنفذ 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`خادم الشات يعمل على المنفذ ${PORT}`);
});
