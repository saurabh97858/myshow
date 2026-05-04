import express from "express";
import { adminLogin, changeAdminPassword } from "../controllers/adminAuthController.js";
import { protectCustomAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);

// Protected routes (requires custom admin auth)
router.put("/change-password", protectCustomAdmin, changeAdminPassword);

export default router;
