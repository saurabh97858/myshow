import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number, // Max discount for percentage type
        default: null
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usersUsed: [{
        type: String // Clerk user IDs
    }],
    perUserLimit: {
        type: Number,
        default: 1 // How many times one user can use this coupon
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTill: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for querying active coupons
couponSchema.index({ active: 1, validTill: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
