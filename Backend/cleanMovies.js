import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const cleanMovies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const movies = await Movie.find({});
        console.log(`🔍 Checking ${movies.length} movies...`);

        let deletedCount = 0;

        for (const movie of movies) {
            const id = movie._id.toString();
            // Check if ID is a valid ObjectId (24 hex chars)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

            if (!isValidObjectId) {
                console.log(`❌ Found invalid movie ID: ${id} (Title: ${movie.title})`);
                await Movie.deleteOne({ _id: id });
                console.log(`   🗑️ Deleted movie: ${movie.title}`);
                deletedCount++;
            }
        }

        console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} invalid movies.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

cleanMovies();
