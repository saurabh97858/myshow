import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import movieRouter from './routes/movieRoutes.js';
import theaterRouter from './routes/theaterRoutes.js';
import proxyRouter from './routes/proxyRoutes.js';
import supportRouter from './routes/supportRoutes.js';
import experienceRouter from './routes/experienceRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import couponRouter from './routes/couponRoutes.js';
import analyticsRouter from './routes/analyticsRoutes.js';
import bulkRouter from './routes/bulkRoutes.js';
import { initializeSocket } from './services/socketService.js';
import http from 'http';

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// ✅ Connect to MongoDB
await connectDB();

// 🔌 Initialize Socket.IO
initializeSocket(server);

// 🔒 Security Middlewares
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading resources from different origins
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// 🧩 Middlewares
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔍 Request Logger
app.use((req, res, next) => {
  console.log(`📢 [${req.method}] ${req.url}`);
  next();
});

// ✅ CORS for frontend + Clerk
app.use(
  cors({
    origin: [
      "https://myshow-su42.vercel.app",
      "https://myshow-wine.vercel.app",
      "http://localhost:5173",
      /^https:\/\/myshow-.*\.vercel\.app$/ // Allow all Vercel previews
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Clerk middleware
app.use(clerkMiddleware());

// 🔒 Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// ✅ Routes
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/movie', movieRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/theater', theaterRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/support', supportRouter);
app.use('/api/experience', experienceRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/bulk', bulkRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Start server
if (process.env.NODE_ENV !== 'production') {
  server.listen(port, () =>
    console.log(`✅ Server running at http://localhost:${port}`)
  );
}

export default app;
