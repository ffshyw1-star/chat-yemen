module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('👤 مستخدم جديد اتصل بشات اليمن:', socket.id);

        // انضمام لغرفة معينة
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`🚪 مستخدم دخل الغرفة: ${roomId}`);
        });

        // استقبال الرسائل وإعادة بثها للمتواجدين بالغرفة
        socket.on('send_message', (data) => {
            io.to(data.room_id).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('❌ غادر مستخدم واحد الشات');
        });
    });
};
