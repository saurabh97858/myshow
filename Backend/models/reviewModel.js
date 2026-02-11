import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
        index: true
    },
    user: {
        type: String, // Clerk user ID
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer between 1-10'
        }
    },
    review: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    helpful: {
        type: Number,
        default: 0
    },
    notHelpful: {
        type: Number,
        default: 0
    },
    helpfulUsers: [{
        type: String // Array of user IDs who marked as helpful
    }],
    notHelpfulUsers: [{
        type: String // Array of user IDs who marked as not helpful
    }]
}, { timestamps: true });

// Compound index for user-movie uniqueness (one review per user per movie)
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

// Index for sorting by helpful count
reviewSchema.index({ helpful: -1 });

// Index for sorting by rating
reviewSchema.index({ rating: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
