import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const debugDB = async () => {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        const db = mongoose.connection.db;

        // 1. Check Movies
        const moviesCollection = db.collection("movies");
        const movies = await moviesCollection.find({}).toArray();
        console.log(`\n📋 Movies (Native): ${movies.length}`);

        let foundMovie = false;
        for (const m of movies) {
            if (m._id === "1062722" || m._id.toString() === "1062722") {
                console.log("   🚨 FOUND INVALID MOVIE '1062722'");
                await moviesCollection.deleteOne({ _id: m._id });
                console.log("   🗑️ DELETED MOVIE '1062722'");
                foundMovie = true;
            }
        }
        if (!foundMovie) console.log("   ✅ No invalid movies found.");

        // 2. Check Shows
        const showsCollection = db.collection("shows");
        const shows = await showsCollection.find({}).toArray();
        console.log(`\n📋 Shows (Native): ${shows.length}`);

        let foundShow = false;
        for (const s of shows) {
            console.log(`   - Show ID: ${s._id} | Movie Ref: ${s.movie} (Type: ${typeof s.movie})`);

            if (s.movie === "1062722" || s.movie.toString() === "1062722") {
                console.log("   🚨 FOUND SHOW REFERENCING '1062722'");
                await showsCollection.deleteOne({ _id: s._id });
                console.log("   🗑️ DELETED SHOW");
                foundShow = true;
            }
        }
        if (!foundShow) console.log("   ✅ No invalid shows found.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

debugDB();
