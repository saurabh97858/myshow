import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin
router.get("/now-playing", getNowPlayingMovies);
router.post("/add", protectAdmin, addShow);

// Public
router.get("/all", getShows);
router.get("/:movieId", getShow); // dynamic route

export default router;
