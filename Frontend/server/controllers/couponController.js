import Coupon from '../models/couponModel.js';

// Validate and apply coupon
export const validateCoupon = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { code, amount } = req.body;

        if (!code || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Code and amount are required'
            });
        }

        // Find coupon
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            active: true
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check validity period
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTill) {
            return res.status(400).json({
                success: false,
                message: 'Coupon has expired or not yet valid'
            });
        }

        // Check min amount
        if (amount < coupon.minAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${coupon.minAmount}`
            });
        }

        // Check usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit reached'
            });
        }

        // Check per-user limit
        const userUsageCount = coupon.usersUsed.filter(id => id === userId).length;
        if (userUsageCount >= coupon.perUserLimit) {
            return res.status(400).json({
                success: false,
                message: 'You have already used this coupon maximum times'
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (amount * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.discountValue;
        }

        discount = Math.min(discount, amount); // Don't exceed total amount
        discount = Math.round(discount); // Round to nearest integer

        res.json({
            success: true,
            message: 'Coupon applied successfully',
            discount,
            finalAmount: amount - discount,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Apply coupon (mark as used)
export const applyCoupon = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Add user to usersUsed array
        coupon.usersUsed.push(userId);
        coupon.usedCount += 1;
        await coupon.save();

        res.json({
            success: true,
            message: 'Coupon applied'
        });
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Create coupon
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minAmount,
            maxDiscount,
            usageLimit,
            perUserLimit,
            validFrom,
            validTill
        } = req.body;

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minAmount,
            maxDiscount,
            usageLimit,
            perUserLimit,
            validFrom,
            validTill
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon
        });
    } catch (error) {
        console.error('Create coupon error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Get all coupons
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Update coupon
export const updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updates = req.body;

        const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            updates,
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            coupon
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findByIdAndDelete(couponId);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
