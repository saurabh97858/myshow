import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from '../server/configs/db.js';
import movieRouter from '../server/routes/movieRoutes.js';
import theaterRouter from '../server/routes/theaterRoutes.js';
import adminRouter from '../server/routes/adminRoutes.js';
import { clerkMiddleware } from '@clerk/express';

import showRouter from '../server/routes/showRoutes.js';
import bookingRouter from '../server/routes/bookingRoutes.js';
import adminApplicationRouter from '../server/routes/adminApplicationRoutes.js';
import userRouter from '../server/routes/userRoutes.js';
import couponRouter from '../server/routes/couponRoutes.js';
import supportRouter from '../server/routes/supportRoutes.js';
import notificationRouter from '../server/routes/notificationRoutes.js';
import reviewRouter from '../server/routes/reviewRoutes.js';
import experienceRouter from '../server/routes/experienceRoutes.js';
import analyticsRouter from '../server/routes/analyticsRoutes.js';
import aiRouter from '../server/routes/aiRoutes.js';

const app = express();

// ✅ Ensure DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Middleware Error:", err.message);
    res.status(500).json({ success: false, message: "DB Connection Failed", error: err.message });
  }
});

app.use(cors());
app.use(express.json());

// Add Clerk middleware as it's needed for admin routes
app.use(clerkMiddleware());

app.get('/api/health', (req, res) => res.send('OK'));
app.use('/api/movie', movieRouter);
app.use('/api/theater', theaterRouter);
app.use('/api/admin', adminRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin-application', adminApplicationRouter);
app.use('/api/user', userRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/support', supportRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/review', reviewRouter);
app.use('/api/experience', experienceRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

export default app;
