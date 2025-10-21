import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  getAllBookings,
  getDashboardData,
  getAllShows,
  isAdmin,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// ✅ Check admin
adminRouter.get("/is-admin", protectAdmin, isAdmin);

// ✅ Dashboard
adminRouter.get("/dashboard", protectAdmin, getDashboardData);

// ✅ All shows
adminRouter.get("/all-shows", protectAdmin, getAllShows);

// ✅ All bookings
adminRouter.get("/all-bookings", protectAdmin, getAllBookings);

export default adminRouter;
