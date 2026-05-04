import express from 'express';
import { requireAuth } from '@clerk/express';
import {
    createReview,
    getMovieReviews,
    voteReview,
    deleteReview,
    getUserReview
} from '../controllers/reviewController.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/:movieId', getMovieReviews);

// Protected routes
router.use(requireAuth());

router.post('/create', reviewLimiter, createReview);
router.get('/user/:movieId', getUserReview);
router.patch('/:reviewId/vote', voteReview);
router.delete('/:reviewId', deleteReview);

export default router;
