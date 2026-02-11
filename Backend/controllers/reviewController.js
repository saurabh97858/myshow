import Review from '../models/reviewModel.js';
import Movie from '../models/Movie.js';
import { clerkClient } from '@clerk/express';

// Create or update a review
export const createReview = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { movieId, rating, review } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 10 || !Number.isInteger(rating)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1-10'
            });
        }

        // Get user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        const userName = `${clerkUser.firstName} ${clerkUser.lastName}`;
        const userImage = clerkUser.imageUrl;

        // Check if movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        // Create or update review (upsert)
        const reviewData = await Review.findOneAndUpdate(
            { movie: movieId, user: userId },
            {
                movie: movieId,
                user: userId,
                userName,
                userImage,
                rating,
                review: review || ''
            },
            { upsert: true, new: true, runValidators: true }
        );

        // Update movie average rating
        await updateMovieRating(movieId);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review: reviewData
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all reviews for a movie
export const getMovieReviews = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { sort = 'recent' } = req.query;

        let sortQuery = {};
        switch (sort) {
            case 'helpful':
                sortQuery = { helpful: -1 };
                break;
            case 'rating-high':
                sortQuery = { rating: -1 };
                break;
            case 'rating-low':
                sortQuery = { rating: 1 };
                break;
            case 'recent':
            default:
                sortQuery = { createdAt: -1 };
        }

        const reviews = await Review.find({ movie: movieId })
            .sort(sortQuery)
            .limit(100);

        // Get review stats
        const stats = await Review.aggregate([
            { $match: { movie: mongoose.Types.ObjectId(movieId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratings: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        // Calculate rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
        if (stats.length > 0 && stats[0].ratings) {
            stats[0].ratings.forEach(rating => {
                distribution[rating] = (distribution[rating] || 0) + 1;
            });
        }

        res.json({
            success: true,
            reviews,
            stats: stats.length > 0 ? {
                avgRating: stats[0].avgRating,
                totalReviews: stats[0].totalReviews,
                distribution
            } : {
                avgRating: 0,
                totalReviews: 0,
                distribution
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark review as helpful/not helpful
export const voteReview = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { reviewId } = req.params;
        const { vote } = req.body; // 'helpful' or 'not-helpful'

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Remove previous vote if exists
        const wasHelpful = review.helpfulUsers.includes(userId);
        const wasNotHelpful = review.notHelpfulUsers.includes(userId);

        if (wasHelpful) {
            review.helpfulUsers = review.helpfulUsers.filter(id => id !== userId);
            review.helpful = Math.max(0, review.helpful - 1);
        }
        if (wasNotHelpful) {
            review.notHelpfulUsers = review.notHelpfulUsers.filter(id => id !== userId);
            review.notHelpful = Math.max(0, review.notHelpful - 1);
        }

        // Add new vote
        if (vote === 'helpful' && !wasHelpful) {
            review.helpfulUsers.push(userId);
            review.helpful += 1;
        } else if (vote === 'not-helpful' && !wasNotHelpful) {
            review.notHelpfulUsers.push(userId);
            review.notHelpful += 1;
        }

        await review.save();

        res.json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Vote review error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete own review
export const deleteReview = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { reviewId } = req.params;

        const review = await Review.findOneAndDelete({
            _id: reviewId,
            user: userId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or unauthorized'
            });
        }

        // Update movie rating after deletion
        await updateMovieRating(review.movie);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's review for a movie
export const getUserReview = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { movieId } = req.params;

        const review = await Review.findOne({
            movie: movieId,
            user: userId
        });

        res.json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Get user review error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to update movie average rating
const updateMovieRating = async (movieId) => {
    try {
        const stats = await Review.aggregate([
            { $match: { movie: mongoose.Types.ObjectId(movieId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        const avgRating = stats.length > 0 ? stats[0].avgRating : 0;
        await Movie.findByIdAndUpdate(movieId, { rating: avgRating });
    } catch (error) {
        console.error('Update movie rating error:', error);
    }
};
