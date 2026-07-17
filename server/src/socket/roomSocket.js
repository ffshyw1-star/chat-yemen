module.exports = (io) => {
    io.on('connection', (socket) => {
        // أحداث الغرف الإضافية هنا
        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`🚪 مستخدم غادر الغرفة رقم: ${roomId}`);
        });
    });
};
