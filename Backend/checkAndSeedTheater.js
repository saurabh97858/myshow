import mongoose from "mongoose";
import dotenv from "dotenv";
import Theater from "./models/Theater.js";
import Show from "./models/showModel.js";

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const theaterCount = await Theater.countDocuments();
        console.log(`Theater Count: ${theaterCount}`);

        if (theaterCount === 0) {
            console.log("Creating a default theater...");
            const newTheater = await Theater.create({
                name: "PVR Cinemas",
                city: "Delhi",
                state: "Delhi",
                location: "Vasant Kunj",
                image: "https://images.unsplash.com/photo-1517604931442-710c22fae29a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                facilities: ["Dolby Atmos", "Recliner", "Food Court"]
            });
            console.log("Created Default Theater:", newTheater._id);
        } else {
            const t = await Theater.findOne();
            console.log("Found existing theater:", t._id);
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        mongoose.disconnect();
    }
};

checkDB();
