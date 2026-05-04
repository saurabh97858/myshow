import { body, param, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Movie validation rules
export const validateMovie = [
    body('title').trim().notEmpty().withMessage('Title is required')
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1-200 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
    body('duration').isInt({ min: 1, max: 500 }).withMessage('Duration must be between 1-500 minutes'),
    body('language').optional().trim().isLength({ max: 50 }),
    body('ticketPrice').isFloat({ min: 0 }).withMessage('Ticket price must be a positive number'),
    body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0-10'),
    handleValidationErrors
];

// Theater validation rules
export const validateTheater = [
    body('name').trim().notEmpty().withMessage('Theater name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Theater name must be between 2-100 characters'),
    body('location').trim().notEmpty().withMessage('Location is required')
        .isLength({ min: 2, max: 200 }).withMessage('Location must be between 2-200 characters'),
    body('city').trim().notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 100 }).withMessage('City must be between 2-100 characters'),
    body('totalSeats').isInt({ min: 1, max: 1000 }).withMessage('Total seats must be between 1-1000'),
    handleValidationErrors
];

// Booking validation rules
export const validateBooking = [
    body('show').isMongoId().withMessage('Invalid show ID'),
    body('bookedSeats').isArray({ min: 1 }).withMessage('At least one seat must be booked'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('contactDetails.name').trim().notEmpty().withMessage('Contact name is required'),
    body('contactDetails.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('contactDetails.mobile').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number is required'),
    handleValidationErrors
];

// Support ticket validation rules
export const validateSupport = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10-1000 characters'),
    handleValidationErrors
];

// Review validation rules
export const validateReview = [
    body('movie').isMongoId().withMessage('Invalid movie ID'),
    body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1-10'),
    body('review').optional().trim().isLength({ max: 1000 }).withMessage('Review must be less than 1000 characters'),
    handleValidationErrors
];

// Coupon validation rules
export const validateCoupon = [
    body('code').trim().notEmpty().withMessage('Coupon code is required')
        .isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3-20 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Coupon code must contain only uppercase letters and numbers'),
    body('type').isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('minAmount').optional().isFloat({ min: 0 }).withMessage('Minimum amount must be positive'),
    body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Maximum discount must be positive'),
    handleValidationErrors
];

// MongoDB ID validation
export const validateMongoId = (fieldName = 'id') => [
    param(fieldName).isMongoId().withMessage(`Invalid ${fieldName}`),
    handleValidationErrors
];
