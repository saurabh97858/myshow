import { Server } from 'socket.io';
import Notification from '../models/notificationModel.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "https://myshow-su42.vercel.app",
                "https://myshow-wine.vercel.app",
                "http://localhost:5173",
                /^https:\/\/myshow-.*\.vercel\.app$/
            ],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Join user to their personal room
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`👤 User ${userId} joined their room`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });

    // Make io available globally
    global.io = io;

    return io;
};

// Send notification to specific user
export const sendNotification = async (userId, type, title, message, data = {}) => {
    try {
        // Save to database
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            data
        });

        // Send via Socket.IO if user is online
        if (io) {
            io.to(userId).emit('new-notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Send notification error:', error);
        throw error;
    }
};

// Send notification to multiple users
export const sendBulkNotifications = async (userIds, type, title, message, data = {}) => {
    try {
        const notifications = await Promise.all(
            userIds.map(userId => sendNotification(userId, type, title, message, data))
        );
        return notifications;
    } catch (error) {
        console.error('Bulk notification error:', error);
        throw error;
    }
};

export default { initializeSocket, sendNotification, sendBulkNotifications };
