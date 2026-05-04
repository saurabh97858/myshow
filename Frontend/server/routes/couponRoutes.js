import express from 'express';
import { requireAuth } from '@clerk/express';
import {
    validateCoupon,
    applyCoupon,
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
} from '../controllers/couponController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Protected routes
router.use(requireAuth());

// User routes
router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);

// Admin routes
router.post('/create', isAdmin, createCoupon);
router.get('/all', isAdmin, getAllCoupons);
router.patch('/:couponId', isAdmin, updateCoupon);
router.delete('/:couponId', isAdmin, deleteCoupon);

export default router;
