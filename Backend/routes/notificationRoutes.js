import express from 'express';
import { requireAuth } from '@clerk/express';
import {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth());

// Get user notifications
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (admin only - could add admin middleware here)
router.post('/create', createNotification);

export default router;
