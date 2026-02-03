
import mongoose from "mongoose";
import 'dotenv/config';
import connectDB from './configs/db.js';
import Booking from './models/bookingModel.js';
import Show from './models/showModel.js';
import Theater from './models/Theater.js';
import Movie from './models/Movie.js'; // Ensure this matches actual filename

const debug = async () => {
    try {
        await connectDB();

        console.log("Fetching bookings...");
        const bookings = await Booking.find({})
            .populate({
                path: "show",
                populate: [
                    { path: "movie" },
                    { path: "theater" }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(1);

        if (bookings.length === 0) {
            console.log("No bookings found.");
        } else {
            const b = bookings[0];
            console.log("Booking found:", b._id);
            console.log("Show:", b.show ? b.show._id : "null");

            if (b.show) {
                console.log("Show Theater Field:", b.show.theater);
                console.log("Show Theater (Populated):", b.show.theater ? b.show.theater.name : "Unpopulated/Null");
                console.log("Show Movie (Populated):", b.show.movie ? b.show.movie.title : "Unpopulated/Null");
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.disconnect();
    }
};

debug();
