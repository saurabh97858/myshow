import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to DB");

        // Check movies
        const movies = await mongoose.connection.db.collection('movies').find({}).toArray();
        console.log(`\n📽️ Movies found: ${movies.length}`);
        movies.forEach(m => console.log(`  - ${m.title} (${m._id})`));

        // Check shows
        const shows = await mongoose.connection.db.collection('shows').find({}).toArray();
        console.log(`\n🎬 Shows found: ${shows.length}`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkDB();
