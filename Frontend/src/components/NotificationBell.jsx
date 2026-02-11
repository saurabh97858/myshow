import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, TrendingUp, HelpCircle, Gift } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [socket, setSocket] = useState(null);
    const dropdownRef = useRef(null);
    const { axios, getToken } = useAppContext();
    const { userId } = useAuth();

    // Initialize Socket.IO
    useEffect(() => {
        if (!userId) return;

        const backendUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
        const newSocket = io(backendUrl, {
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('🔌 Connected to notifications');
            newSocket.emit('join', userId);
        });

        newSocket.on('new-notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo.png'
                });
            }
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [userId]);

    // Fetch notifications
    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    // Request browser notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch('/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Check className="w-4 h-4" />;
            case 'reminder': return <Clock className="w-4 h-4" />;
            case 'trending': return <TrendingUp className="w-4 h-4" />;
            case 'support': return <HelpCircle className="w-4 h-4" />;
            case 'offer': return <Gift className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'booking': return 'text-green-500 bg-green-500/10';
            case 'reminder': return 'text-blue-500 bg-blue-500/10';
            case 'trending': return 'text-orange-500 bg-orange-500/10';
            case 'support': return 'text-purple-500 bg-purple-500/10';
            case 'offer': return 'text-pink-500 bg-pink-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
        return date.toLocaleDateString();
    };

    if (!userId) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium mb-0.5">{notification.title}</h4>
                                            <p className="text-xs text-gray-400 mb-1 line-clamp-2">{notification.message}</p>
                                            <p className="text-[10px] text-gray-500">{formatTime(notification.sentAt)}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1 items-end">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-xs text-primary hover:text-primary/80"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="text-xs text-gray-500 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
