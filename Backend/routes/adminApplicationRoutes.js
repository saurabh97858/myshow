import express from "express";
import { protectAdmin, protectSuperAdmin, requireAnyAuth } from "../middleware/auth.js";
import {
    submitApplication,
    getMyApplication,
    getAllApplications,
    approveApplication,
    rejectApplication,
} from "../controllers/adminApplicationController.js";

const router = express.Router();

// All routes require Clerk auth
router.use(requireAnyAuth);

// User routes
router.post("/submit", submitApplication);
router.get("/my-status", getMyApplication);

// Super Admin only routes
router.get("/all", protectSuperAdmin, getAllApplications);
router.put("/approve/:id", protectSuperAdmin, approveApplication);
router.put("/reject/:id", protectSuperAdmin, rejectApplication);

export default router;
