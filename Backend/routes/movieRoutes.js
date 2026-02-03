import express from "express";
import {
    getAllMovies,
    getMovieById,
    addMovie,
    updateMovie,
    deleteMovie,
    addDummyMovies,
} from "../controllers/movieController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Public routes
router.get("/all", getAllMovies);
router.get("/:id", getMovieById);

// Admin-only routes (protected)
router.post("/add", requireAuth(), addMovie);
router.put("/update/:id", requireAuth(), updateMovie);
router.delete("/delete/:id", requireAuth(), deleteMovie);
router.post("/add-dummy", requireAuth(), addDummyMovies);

export default router;
