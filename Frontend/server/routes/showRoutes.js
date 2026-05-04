import express from "express";
import { addShow, getShow, getShows, getShowById } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin
router.post("/add", protectAdmin, addShow);

// Public
router.get("/all", getShows);
router.get("/single/:showId", getShowById); // Get show by showId
router.get("/:movieId", getShow); // Get show by movieId (dynamic route)

export default router;

