import {Server} from "socket.io"
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})

const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('setup', (userId) => {
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        
        socket.broadcast.emit('userOnline', userId);
        
        io.to(userId).emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on('newMessage', (message) => {
        const chat = message.chat;
        
        if (!chat || !chat.users) {
            if (message.receiverId) {
                socket.to(message.receiverId).emit('messageReceived', message);
            }
            return;
        }

        chat.users.forEach(user => {
            if (user._id === message.senderId) return;
            
            socket.in(user._id).emit('messageReceived', message);
        });
    });

    socket.on('typing', ({ chatId, userId }) => {
        socket.in(chatId).emit('typing', { chatId, userId });
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
        socket.in(chatId).emit('stopTyping', { chatId, userId });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit('userOffline', userId);
                io.emit('onlineUsers', Array.from(onlineUsers.keys()));
                break;
            }
        }
    });

    socket.on('messageRead', ({ messageId, chatId, userId }) => {
        socket.in(chatId).emit('messageRead', { messageId, userId });
    });
});

export {io,server,app};