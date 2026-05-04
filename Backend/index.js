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
import adminApplicationRouter from './routes/adminApplicationRoutes.js';
import adminAuthRouter from './routes/adminAuthRoutes.js';
import aiRouter from './routes/aiRoutes.js';
import { initializeSocket } from './services/socketService.js';
import http from 'http';

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// NOTE: top-level await connectDB() is removed for Vercel compatibility.
// Connection is now handled by the 'Ensure DB Connection Middleware' below.

// 🔌 Initialize Socket.IO (Disabled for Vercel/Production as it is not supported)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  initializeSocket(server);
}

// ✅ Ensure DB Connection Middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// 🧩 Middlewares - Logging & CORS first
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
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      /^http:\/\/localhost:517\d$/, // Allow localhost:5170-5179
      /^https:\/\/.*\.vercel\.app$/ // Allow all Vercel deployments
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Clerk middleware
console.log("🔑 [Server] Clerk Init - PublishableKey:", !!process.env.CLERK_PUBLISHABLE_KEY, "SecretKey:", !!process.env.CLERK_SECRET_KEY);
app.use(clerkMiddleware());

// NOTE: Clerk's req.auth is a Proxy — it supports BOTH:
//   req.auth()        → function call (used by getAuth(req))
//   req.auth.userId   → property access (backwards compat)
// Do NOT overwrite req.auth anywhere or getAuth(req) will crash.

app.use((req, res, next) => {
    if (req.headers.authorization) {
        console.log(`🛰️ [Server] Auth Header detected for ${req.url} (Length: ${req.headers.authorization.length}) | Start: ${req.headers.authorization.substring(0, 20)}...`);
    }
    next();
});

// 🔒 Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// ✅ Routes
app.get('/', (req, res) => {
    console.log(`🏠 [Server] Root route accessed from ${req.ip} | Method: ${req.method} | OriginalURL: ${req.originalUrl}`);
    res.send('Server is Live!');
});
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/movie', movieRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin-application', adminApplicationRouter);
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
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/ai', aiRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 Catch-all
app.use((req, res) => {
    console.error(`⚠️ [404 Not Found] ${req.method} ${req.url} - No route matched.`);
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found on this server.` });
});

// ✅ Start server
// On Render, we need to listen explicitly. Vercel handles this differently.
server.listen(port, () =>
  console.log(`✅ Server running at http://localhost:${port}`)
);

export default app;
