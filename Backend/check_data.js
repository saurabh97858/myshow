import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";
import Theater from "./models/Theater.js";
import Show from "./models/showModel.js";

dotenv.config();

const checkData = async () => {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        const movieCount = await Movie.countDocuments();
        const theaterCount = await Theater.countDocuments();
        const showCount = await Show.countDocuments();

        console.log(`\n📊 Data Stats:`);
        console.log(`   - Movies: ${movieCount}`);
        console.log(`   - Theaters: ${theaterCount}`);
        console.log(`   - Shows: ${showCount}`);

        if (movieCount > 0) {
            const sampleMovie = await Movie.findOne();
            console.log(`\n🎬 Sample Movie: ${sampleMovie.title} (ID: ${sampleMovie._id})`);
        }

        if (theaterCount > 0) {
            const sampleTheater = await Theater.findOne();
            console.log(`\n🏢 Sample Theater: ${sampleTheater.name} (City: ${sampleTheater.city})`);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkData();
