import mongoose from "mongoose";
import dotenv from "dotenv";
import Theater from "./models/Theater.js";

dotenv.config();

const checkTheaters = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to DB");

        const count = await Theater.countDocuments();
        console.log(`Total Theaters: ${count}`);

        const cities = await Theater.distinct("city");
        console.log("Cities found:", cities);

        const theaters = await Theater.find({});
        theaters.forEach(t => console.log(`${t.name} - ${t.city} (${t.state})`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkTheaters();
