import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";
import Show from "./models/showModel.js";

dotenv.config();

const debugShows = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        // 1. Get all shows with populated movies
        console.log("\n📋 All Shows (with populated movies):");
        const shows = await Show.find({}).populate("movie");

        shows.forEach((show, i) => {
            console.log(`\n[Show ${i}]`);
            console.log(`  Show ID: ${show._id}`);
            console.log(`  Movie Ref: ${show.movie}`);

            if (show.movie) {
                console.log(`  Movie _id: ${show.movie._id}`);
                console.log(`  Movie title: ${show.movie.title}`);
            } else {
                console.log(`  ⚠️ Movie population failed or movie deleted!`);
            }
        });

        // 2. Check for shows with invalid movie references
        console.log("\n\n🔍 Checking for orphaned shows (movie reference doesn't exist)...");
        const showsRaw = await Show.find({});

        for (const show of showsRaw) {
            const movieExists = await Movie.findById(show.movie);
            if (!movieExists) {
                console.log(`❌ Show ${show._id} references non-existent movie ${show.movie}`);
                console.log(`   Deleting orphaned show...`);
                await Show.findByIdAndDelete(show._id);
                console.log(`   ✅ Deleted.`);
            }
        }

        console.log("\n✅ Cleanup complete.");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugShows();
