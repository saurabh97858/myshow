import express from 'express';
import { requireAuth } from '@clerk/express';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    getRevenueAnalytics,
    getOccupancyAnalytics,
    getPeakTimes,
    getPopularityAnalytics,
    getUserDemographics,
    getDashboardSummary
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require admin authentication
router.use(requireAuth(), isAdmin);

router.get('/revenue', getRevenueAnalytics);
router.get('/occupancy', getOccupancyAnalytics);
router.get('/peak-times', getPeakTimes);
router.get('/popularity', getPopularityAnalytics);
router.get('/demographics', getUserDemographics);
router.get('/summary', getDashboardSummary);

export default router;
