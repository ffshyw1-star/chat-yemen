module.exports = (io) => {
    io.on('connection', (socket) => {
        // يمكن بث عدد المتصلين الإجمالي هنا عند دخول أي مستخدم
        io.emit('update_online_count', { online: io.engine.clientsCount });

        socket.on('disconnect', () => {
            io.emit('update_online_count', { online: io.engine.clientsCount });
        });
    });
};
