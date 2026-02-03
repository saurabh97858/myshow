import mongoose from "mongoose";
import dotenv from "dotenv";
import Theater from "./models/Theater.js";
import Movie from "./models/Movie.js";

dotenv.config();

const debugImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("\n--- Checking Theaters ---");
        const theaters = await Theater.find().limit(3);
        if (theaters.length === 0) console.log("No theaters found.");
        theaters.forEach(t => console.log(`Theater: ${t.name}, Image: ${t.image}`));

        console.log("\n--- Checking Movies ---");
        const movies = await Movie.find().limit(3);
        if (movies.length === 0) console.log("No movies found.");
        movies.forEach(m => console.log(`Movie: ${m.title}, Poster: ${m.posterUrl}`));

        mongoose.disconnect();
    } catch (error) {
        console.error(error);
        mongoose.disconnect();
    }
};

debugImages();
