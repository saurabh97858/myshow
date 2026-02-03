import { clerkClient } from "@clerk/express";
import Booking from "../models/bookingModel.js";
import Movie from "../models/Movie.js";

// API controller function to get user bookings
export const getUserBookings = async (req, res) => {
    try {
        console.log("Get User Bookings - Req.auth:", req.auth);
        const userId = req.auth.userId;
        console.log("Get User Bookings - UserID:", userId);

        const bookings = await Booking.find({ user: userId })
            .populate({
                path: "show",
                populate: [
                    { path: "movie" },
                    { path: "theater" }
                ]
            })
            .sort({ createdAt: -1 });

        console.log("Get User Bookings - Found:", bookings.length);
        if (bookings.length > 0) {
            console.log("Sample Booking Show:", JSON.stringify(bookings[0].show, null, 2));
        }
        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API controller function to update favourite movie in clerk user metadata
export const updateFavourite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth.userId;

        const user = await clerkClient.users.getUser(userId);

        if (!user.privateMetadata.favourites) {
            user.privateMetadata.favourites = [];
        }

        if (!user.privateMetadata.favourites.includes(movieId)) {
            user.privateMetadata.favourites.push(movieId);
        } else {
            user.privateMetadata.favourites = user.privateMetadata.favourites.filter(
                (item) => item !== movieId
            );
        }

        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata,
        });

        res.json({ success: true, message: "Favourite movies updated." });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API controller function to get user's favourite movies
export const getFavourites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth.userId);
        const favourites = user.privateMetadata?.favourites || [];

        if (favourites.length === 0) {
            return res.json({ success: true, movies: [] });
        }

        const movies = await Movie.find({ _id: { $in: favourites } });
        res.json({ success: true, movies });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};