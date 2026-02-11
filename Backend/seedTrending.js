import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

// Try loading from .env in the current directory (Backend)
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myshow";

const seedTrending = async () => {
    try {
        console.log("Connecting to DB:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const movies = await Movie.find().limit(6);
        console.log(`Found ${movies.length} movies.`);

        if (movies.length === 0) {
            console.log("No movies found.");
            process.exit();
            return;
        }

        const ids = movies.map(m => m._id);

        await Movie.updateMany(
            { _id: { $in: ids } },
            { $set: { isTrending: true } }
        );

        console.log(`Updated ${movies.length} movies to be trending.`);
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

seedTrending();
