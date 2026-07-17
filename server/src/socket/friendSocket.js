module.exports = (io) => {
    io.on('connection', (socket) => {
        // حدث إرسال طلب صداقة فوري
        socket.on('send_friend_request', (data) => {
            // إرسال الإشعار الفوري للمستخدم المستقبل عبر الـ id الخاص به
            io.to(`user_${data.receiver_id}`).emit('new_friend_request', data);
        });
    });
};
