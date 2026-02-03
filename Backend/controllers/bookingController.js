import Show from "../models/showModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import { clerkClient } from "@clerk/express";

// Function to check availability of selected seats
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { showId, selectedSeats, amount, contactDetails, foodItems } = req.body;

        // Sync User to MongoDB
        try {
            const clerkUser = await clerkClient.users.getUser(userId);
            const name = clerkUser.firstName + " " + clerkUser.lastName;
            const email = clerkUser.emailAddresses[0].emailAddress;
            const image = clerkUser.imageUrl;

            await User.findByIdAndUpdate(
                userId,
                { name, email, image },
                { upsert: true, new: true }
            );
        } catch (userError) {
            console.error("Failed to sync user:", userError);
            // Continue booking even if sync fails (though name might be missing in admin)
        }

        // get show details
        const showData = await Show.findById(showId).populate('movie');

        // create booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: amount || (showData.priceStandard * selectedSeats.length),
            bookedSeats: selectedSeats,
            contactDetails: contactDetails,
            foodItems: foodItems || []
        });

        // mark seats as occupied
        if (!showData.occupiedSeats) showData.occupiedSeats = {};

        selectedSeats.forEach(seat => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified('occupiedSeats');
        await showData.save();

        res.json({ success: true, message: "Booked successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all occupied seats for a show
export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        if (!showData) {
            return res.json({ success: false, message: "Show not found" });
        }

        const occupiedSeats = Object.keys(showData.occupiedSeats);
        res.json({ success: true, occupiedSeats });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
