const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// إعداد سعة نقل البيانات لاستقبال الصور الكبيرة والمذكرات الصوتية بدون مشاكل
const io = new Server(server, {
  maxHttpBufferSize: 1e7, // 10 ميجابايت
  cors: { origin: "*" }
});

// تشغيل الملفات الساكنة (ستضع ملف الـ HTML في مجلد اسمه public)
app.use(express.static(path.join(__dirname, 'public')));

// تخزين قائمة المستخدمين النشطين في الذاكرة
let activeUsers = {};

io.on('connection', (socket) => {
  console.log('مستخدم جديد اتصل بالخادم:', socket.id);

  // 1. استقبال حدث دخول المستخدم وتخزين بياناته
  socket.on('join_user', (userData) => {
    activeUsers[socket.id] = {
      id: socket.id,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      color: userData.color
    };
    
    // إرسال القائمة المحدثة للمتواجدين إلى الجميع
    io.emit('update_users_list', Object.values(activeUsers));
    
    // بث رسالة نظام للجميع تفيد بانضمام المستخدم
    socket.broadcast.emit('system_broadcast', {
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      type: 'join'
    });
  });

  // 2. استقبال الرسائل النصية وبثها فوراً للجميع
  socket.on('send_text_message', (msgData) => {
    const user = activeUsers[socket.id] || msgData;
    io.emit('receive_message', {
      type: 'text',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      text: msgData.text
    });
  });

  // 3. استقبال ملفات الصور المرفوعة وبثها فوراً للجميع
  socket.on('send_image_message', (imageData) => {
    const user = activeUsers[socket.id] || imageData;
    io.emit('receive_message', {
      type: 'image',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      imageSrc: imageData.imageSrc
    });
  });

  // 4. استقبال المذكرات الصوتية وبثها فوراً للجميع
  socket.on('send_voice_message', (voiceData) => {
    const user = activeUsers[socket.id] || voiceData;
    io.emit('receive_message', {
      type: 'voice',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color
    });
  });

  // 5. معالجة خروج المستخدم أو انقطاع اتصاله
  socket.on('disconnect', () => {
    if (activeUsers[socket.id]) {
      console.log('مستخدم غادر الشات:', activeUsers[socket.id].name);
      delete activeUsers[socket.id];
      io.emit('update_users_list', Object.values(activeUsers));
    }
  });
});

// تشغيل الخادم على المنفذ 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`خادم الشات يعمل بنجاح على الرابط: http://localhost:${PORT}`);
});
