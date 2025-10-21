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

const app = express();
const port = process.env.PORT || 3000;

// ✅ Connect to MongoDB
await connectDB();

// 🧩 Middlewares
app.use(express.json());

// ✅ CORS for frontend + Clerk
app.use(
  cors({
    origin: "http://localhost:5173", // frontend port
    credentials: true,               // cookies + auth headers allowed
  })
);

// ✅ Clerk middleware
app.use(clerkMiddleware());

// ✅ Routes
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// ✅ Start server
app.listen(port, () =>
  console.log(`✅ Server running at http://localhost:${port}`)
);
