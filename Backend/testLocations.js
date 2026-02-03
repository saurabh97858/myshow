import mongoose from "mongoose";
import dotenv from "dotenv";
import Theater from "./models/Theater.js";

dotenv.config();

const testGetLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const locations = await Theater.aggregate([
            {
                $group: {
                    _id: { state: "$state", city: "$city" }
                }
            },
            {
                $project: {
                    _id: 0,
                    state: "$_id.state",
                    city: "$_id.city"
                }
            },
            { $sort: { city: 1 } }
        ]);

        console.log("Locations from Aggregation:", JSON.stringify(locations, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testGetLocations();
