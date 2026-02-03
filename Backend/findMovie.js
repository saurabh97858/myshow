import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const findSpecificMovie = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        const searchTerm = "The Conjuring";
        console.log(`🔍 Searching for movies containing '${searchTerm}'...`);

        const movies = await Movie.find({ title: { $regex: searchTerm, $options: "i" } });

        if (movies.length === 0) {
            console.log("❌ No movies found matching the search term.");

            // List ALL movies to be sure
            console.log("\n📋 Listing ALL movies in DB:");
            const allMovies = await Movie.find({});
            allMovies.forEach(m => console.log(`- ${m.title} (ID: ${m._id})`));
        } else {
            console.log(`✅ Found ${movies.length} matches:`);
            movies.forEach(m => {
                console.log(JSON.stringify(m, null, 2));
            });
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findSpecificMovie();
