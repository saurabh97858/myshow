// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';

import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import movieRouter from './routes/movieRoutes.js';
import theaterRouter from './routes/theaterRoutes.js';
import proxyRouter from './routes/proxyRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// ✅ Connect to MongoDB
await connectDB();

// 🧩 Middlewares
app.use(express.json());

// 🔍 Request Logger
app.use((req, res, next) => {
  console.log(`📢 [${req.method}] ${req.url}`);
  next();
});

// ✅ CORS for frontend + Clerk
app.use(
  cors({
    origin: true, // Allow all origins (reflects request origin)
    credentials: true,
  })
);

// ✅ Clerk middleware
app.use(clerkMiddleware());

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

// ✅ Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () =>
    console.log(`✅ Server running at http://localhost:${port}`)
  );
}

export default app;
