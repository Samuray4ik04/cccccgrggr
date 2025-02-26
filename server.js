const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
    socket.on('new-user', (username) => {
        users[socket.id] = username;
        io.emit('user-connected', username);
    });

    socket.on('send-message', (message) => {
        io.emit('message', {
            username: users[socket.id],
            text: message,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('user-disconnected', users[socket.id]);
            delete users[socket.id];
        }
    });
});

server.listen(3000, () => console.log('Сервер запущен на порту 3000'));