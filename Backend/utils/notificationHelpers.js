import { sendNotification } from '../services/socketService.js';

// Helper function to send booking confirmation notification
export const sendBookingConfirmation = async (userId, booking) => {
    try {
        const title = '🎉 Booking Confirmed!';
        const message = `Your booking for ${booking.show?.movie?.title || 'movie'} has been confirmed. Enjoy the show!`;

        await sendNotification(userId, 'booking', title, message, {
            bookingId: booking._id,
            movieId: booking.show?.movie?._id,
            showId: booking.show?._id
        });
    } catch (error) {
        console.error('Error sending booking confirmation:', error);
    }
};

// Helper function to send support ticket update notification
export const sendSupportUpdate = async (userId, ticket, newStatus) => {
    try {
        let title = '';
        let message = '';

        switch (newStatus) {
            case 'In Progress':
                title = '🔄 Support Ticket In Progress';
                message = `Your support ticket #${ticket._id.toString().slice(-6)} is now being processed by our team.`;
                break;
            case 'Resolved':
                title = '✅ Support Ticket Resolved';
                message = `Your support ticket #${ticket._id.toString().slice(-6)} has been resolved. Thank you for your patience!`;
                break;
            default:
                title = '📝 Support Ticket Updated';
                message = `Your support ticket #${ticket._id.toString().slice(-6)} has been updated.`;
        }

        await sendNotification(userId, 'support', title, message, {
            supportId: ticket._id
        });
    } catch (error) {
        console.error('Error sending support update:', error);
    }
};

// Helper function to send trending movie notification to all users
export const sendTrendingMovieAlert = async (movie) => {
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = (await import('../models/userModel.js')).default;

        // Get all users
        const users = await User.find({}).select('_id');

        const title = '🔥 New Trending Movie!';
        const message = `${movie.title} is now trending! Book your tickets now.`;

        // Send to all users
        for (const user of users) {
            await sendNotification(user._id, 'trending', title, message, {
                movieId: movie._id
            });
        }
    } catch (error) {
        console.error('Error sending trending movie alert:', error);
    }
};

// Helper function to send special offer notification
export const sendSpecialOffer = async (userId, offerDetails) => {
    try {
        const title = '🎁 Special Offer!';
        const message = offerDetails.message || 'Check out our latest special offers and discounts!';

        await sendNotification(userId, 'offer', title, message, {
            offerId: offerDetails.id
        });
    } catch (error) {
        console.error('Error sending special offer:', error);
    }
};

// Helper function to send show reminder (called by cron job)
export const sendShowReminder = async (userId, show) => {
    try {
        const title = '⏰ Show Reminder';
        const message = `Your show "${show.movie?.title}" starts in 1 hour! Don't be late.`;

        await sendNotification(userId, 'reminder', title, message, {
            showId: show._id,
            movieId: show.movie?._id
        });
    } catch (error) {
        console.error('Error sending show reminder:', error);
    }
};
