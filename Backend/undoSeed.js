import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const moviesResponse = [
    "Interstellar",
    "Inception",
    "3 Idiots",
    "RRR",
    "The Dark Knight",
    "Dangal",
    "Avatar: The Way of Water",
    "Jawan",
    "Brahmastra Part One: Shiva",
    "Oppenheimer"
];

const undoSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for undoing seed...");

        const result = await Movie.deleteMany({ title: { $in: moviesResponse } });
        console.log(`Deleted ${result.deletedCount} dummy movies successfully!`);

        mongoose.disconnect();
        console.log("Disconnected.");
    } catch (error) {
        console.error("Error undoing seed:", error);
        mongoose.disconnect();
    }
};

undoSeed();
