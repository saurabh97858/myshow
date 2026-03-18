import express from "express";
import {
    getAllMovies,
    getMovieById,
    addMovie,
    updateMovie,
    deleteMovie,
    addDummyMovies,
    seedTrendingMovies,
} from "../controllers/movieController.js";
import { protectSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Temporary route (Move to top to avoid :id conflict)
router.post("/seed-trending", seedTrendingMovies);

// Public routes
router.get("/all", getAllMovies);
router.get("/:id", getMovieById);

// Admin-only routes (protected)

// Admin-only routes (protected)
router.post("/add", protectSuperAdmin, addMovie);
router.put("/update/:id", protectSuperAdmin, updateMovie);
router.delete("/delete/:id", protectSuperAdmin, deleteMovie);
router.post("/add-dummy", protectSuperAdmin, addDummyMovies);

export default router;
