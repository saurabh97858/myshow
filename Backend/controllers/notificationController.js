import Notification from '../models/notificationModel.js';

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        const { user, type, title, message, data } = req.body;

        const notification = await Notification.create({
            user,
            type,
            title,
            message,
            data
        });

        // Emit socket event if socket service is available
        if (global.io) {
            global.io.to(user).emit('new-notification', notification);
        }

        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.auth.userId; // From Clerk middleware

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({
            user: userId,
            read: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.auth.userId;

        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const count = await Notification.countDocuments({
            user: userId,
            read: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
