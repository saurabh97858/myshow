import express from "express";
import { protectAdmin, protectSuperAdmin, requireAnyAuth } from "../middleware/auth.js";
import {
  getAllBookings,
  getDashboardData,
  getAllShows,
  isAdmin,
  getAllAdmins,
  removeAdmin,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// ✅ Check admin (temporarily removed requireAuth for debugging logs)
adminRouter.get("/is-admin", protectAdmin, isAdmin);

// ✅ Dashboard (protectAdmin already handles both Clerk + custom admin auth)
adminRouter.get("/dashboard", protectAdmin, getDashboardData);

// ✅ All shows
adminRouter.get("/all-shows", protectAdmin, getAllShows);

// ✅ All bookings
adminRouter.get("/all-bookings", protectAdmin, getAllBookings);

// ✅ Super Admin only - Manage admins
adminRouter.get("/admins/list", protectSuperAdmin, getAllAdmins);
adminRouter.delete("/admins/remove/:id", protectSuperAdmin, removeAdmin);

export default adminRouter;
