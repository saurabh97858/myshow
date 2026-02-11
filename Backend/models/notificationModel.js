import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        index: true // Index for faster queries
    },
    type: {
        type: String,
        enum: ['booking', 'reminder', 'trending', 'support', 'offer'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        supportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Support' },
        showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show' },
        offerId: { type: String }
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index for user queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
