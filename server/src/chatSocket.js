module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('👤 مستخدم جديد اتصل بالشات:', socket.id);

        // عند دخول غرفة معينة
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`🚪 المستخدم دخل الغرفة رقم: ${roomId}`);
        });

        // عند إرسال رسالة جديدة
        socket.on('send_message', (data) => {
            // إرسال الرسالة لجميع المتواجدين في نفس الغرفة
            io.to(data.room_id).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('❌ مستخدم غادر الشات');
        });
    });
};
