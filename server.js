const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 1e7,
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yemen_chat_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// نموذج الرسائل
const MessageSchema = new mongoose.Schema({
  type: String,
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
let mutedUsers = {}; // قائمة المستخدمين المكتومين مؤقتاً
let bannedIPs = {};  // قائمة المحظورين (يمكن تطويرها لاحقاً بقاعدة بيانات)

io.on('connection', async (socket) => {
  console.log('مستخدم جديد اتصل بالسيرفر:', socket.id);

  // جلب سجل الشات
  try {
    const oldMessages = await Message.find().sort({ timestamp: -1 }).limit(50);
    socket.emit('load_chat_history', oldMessages.reverse());
  } catch (err) {
    console.error(err);
  }

  // استقبال حدث دخول المستخدم
  socket.on('join_user', (userData) => {
    // التحقق من الحظر
    if (bannedIPs[userData.name]) {
      socket.emit('admin_action_received', { action: 'banned_alert' });
      socket.disconnect();
      return;
    }

    activeUsers[socket.id] = {
      id: socket.id,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      color: userData.color
    };
    
    io.emit('update_users_list', Object.values(activeUsers));
  });

  // التحقق من صلاحية الإدارة للعمليات الحمائية
  const isManager = (role) => ['mod', 'admin', 'owner'].includes(role);

  // تنفيذ الأوامر الإدارية (كتم، طرد، حظر)
  socket.on('admin_execute_action', (data) => {
    const adminUser = activeUsers[socket.id];
    if (!adminUser || !isManager(adminUser.role)) return; // حماية السيرفر من الاختراق

    const targetSocketId = data.targetId;
    const targetUser = activeUsers[targetSocketId];
    if (!targetUser) return;

    if (data.action === 'mute') {
      mutedUsers[targetUser.name] = true;
      io.to(targetSocketId).emit('admin_action_received', { action: 'mute', duration: 60 });
      io.emit('system_broadcast', { name: targetUser.name, type: 'mute_alert' });
    } 
    else if (data.action === 'kick') {
      io.to(targetSocketId).emit('admin_action_received', { action: 'kick' });
      io.emit('system_broadcast', { name: targetUser.name, type: 'kick_alert' });
    } 
    else if (data.action === 'ban') {
      bannedIPs[targetUser.name] = true;
      io.to(targetSocketId).emit('admin_action_received', { action: 'kick' });
      io.emit('system_broadcast', { name: targetUser.name, type: 'ban_alert' });
    }
  });

  // استقبال وحفظ الرسائل النصية مع فحص الكتم
  socket.on('send_text_message', async (msgData) => {
    const user = activeUsers[socket.id];
    if (!user) return;
    if (mutedUsers[user.name]) return socket.emit('admin_action_received', { action: 'still_muted' });

    const newMsg = new Message({
      type: 'text', name: user.name, role: user.role, avatar: user.avatar, color: user.color, text: msgData.text
    });
    try {
      await newMsg.save();
      io.emit('receive_message', newMsg);
    } catch (err) { console.error(err); }
  });

  // استقبال وحفظ رسائل الصور مع فحص الكتم
  socket.on('send_image_message', async (imageData) => {
    const user = activeUsers[socket.id];
    if (!user) return;
    if (mutedUsers[user.name]) return socket.emit('admin_action_received', { action: 'still_muted' });

    const newImgMsg = new Message({
      type: 'image', name: user.name, role: user.role, avatar: user.avatar, color: user.color, imageSrc: imageData.imageSrc
    });
    try {
      await newImgMsg.save();
      io.emit('receive_message', newImgMsg);
    } catch (err) { console.error(err); }
  });

  socket.on('disconnect', () => {
    if (activeUsers[socket.id]) {
      delete activeUsers[socket.id];
      io.emit('update_users_list', Object.values(activeUsers));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 خادم التحكم الإداري يعمل على: http://localhost:${PORT}`);
});
