import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const checkMovies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Movie.countDocuments();
        const movies = await Movie.find().sort({ _id: -1 }).limit(5);

        console.log(`Total Movies: ${count}`);
        console.log("Latest 5 Movies:");
        movies.forEach(m => console.log(`- ${m.title} (${m.category})`));

        mongoose.disconnect();
    } catch (error) {
        console.error(error);
        mongoose.disconnect();
    }
};

checkMovies();
