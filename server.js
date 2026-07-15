const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 1e7, // 10 ميجابايت لاستقبال الصور والمقاطع الصوتية
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة بيانات MongoDB (محلياً أو سحابياً عبر متغيرات البيئة)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yemen_chat_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// هيكلة نموذج الرسائل لحفظها في قاعدة البيانات
const MessageSchema = new mongoose.Schema({
  type: String,     // text, image, voice
  name: String,
  role: String,
  avatar: String,
  color: String,
  text: String,
  imageSrc: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

let activeUsers = {};

io.on('connection', async (socket) => {
  console.log('مستخدم جديد اتصل بالسيرفر:', socket.id);

  // جلب آخر 50 رسالة محفوظة فور دخول أي هاتف أو مستخدم جديد
  try {
    const oldMessages = await Message.find().sort({ timestamp: -1 }).limit(50);
    socket.emit('load_chat_history', oldMessages.reverse());
  } catch (err) {
    console.error('خطأ في جلب سجل المحادثات:', err);
  }

  // استقبال حدث دخول المستخدم
  socket.on('join_user', (userData) => {
    activeUsers[socket.id] = {
      id: socket.id,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      color: userData.color
    };
    
    io.emit('update_users_list', Object.values(activeUsers));
    
    socket.broadcast.emit('system_broadcast', {
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      type: 'join'
    });
  });

  // استقبال وحفظ الرسائل النصية
  socket.on('send_text_message', async (msgData) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const newMsg = new Message({
      type: 'text',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      text: msgData.text
    });

    try {
      await newMsg.save();
      io.emit('receive_message', newMsg);
    } catch (err) {
      console.error('خطأ في حفظ الرسالة النصية:', err);
    }
  });

  // استقبال وحفظ ملفات الصور المرفوعة
  socket.on('send_image_message', async (imageData) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const newImgMsg = new Message({
      type: 'image',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      imageSrc: imageData.imageSrc
    });

    try {
      await newImgMsg.save();
      io.emit('receive_message', newImgMsg);
    } catch (err) {
      console.error('خطأ في حفظ رسالة الصورة:', err);
    }
  });

  // استقبال وحفظ المذكرات الصوتية
  socket.on('send_voice_message', async () => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const newVoiceMsg = new Message({
      type: 'voice',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color
    });

    try {
      await newVoiceMsg.save();
      io.emit('receive_message', newVoiceMsg);
    } catch (err) {
      console.error('خطأ في حفظ المذكرة الصوتية:', err);
    }
  });

  // معالجة خروج المستخدم أو انقطاع الاتصال
  socket.on('disconnect', () => {
    if (activeUsers[socket.id]) {
      delete activeUsers[socket.id];
      io.emit('update_users_list', Object.values(activeUsers));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 خادم الشات وقاعدة البيانات يعملان على: http://localhost:${PORT}`);
});
