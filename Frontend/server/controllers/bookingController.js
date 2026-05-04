import Show from "../models/showModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import { clerkClient } from "@clerk/express";
import { sendBookingConfirmation } from "../utils/notificationHelpers.js";

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
            foodItems: foodItems || [],
            isPaid: true, // Mark as paid immediately since we simulate success
            paymentId: 'DEMO-' + Date.now()
        });

        // mark seats as occupied
        if (!showData.occupiedSeats) showData.occupiedSeats = {};

        selectedSeats.forEach(seat => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified('occupiedSeats');
        await showData.save();

        // Send booking confirmation notification
        const bookingWithShow = await Booking.findById(booking._id).populate({
            path: 'show',
            populate: { path: 'movie' }
        });
        await sendBookingConfirmation(userId, bookingWithShow);

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

// Cancel booking with refund calculation
export const cancelBooking = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { bookingId } = req.params;
        const { reason } = req.body;

        // Find booking
        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: 'movie' }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check ownership
        if (booking.user !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if already cancelled
        if (booking.isCancelled) {
            return res.status(400).json({
                success: false,
                message: 'Booking already cancelled'
            });
        }

        // Calculate refund based on show time
        const showTime = new Date(`${booking.show.date}T${booking.show.time}`);
        const now = new Date();
        const hoursUntilShow = (showTime - now) / (1000 * 60 * 60);

        let refundPercentage = 0;
        if (hoursUntilShow > 48) {
            refundPercentage = 100; // Full refund
        } else if (hoursUntilShow > 24) {
            refundPercentage = 80; // 80% refund
        } else if (hoursUntilShow > 2) {
            refundPercentage = 50; // 50% refund
        } else {
            refundPercentage = 0; // No refund
        }

        const refundAmount = Math.round((booking.amount * refundPercentage) / 100);

        // Update booking
        booking.isCancelled = true;
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.refundAmount = refundAmount;
        booking.cancellationReason = reason || 'User requested';
        await booking.save();

        // Free up seats
        const showData = await Show.findById(booking.show._id);
        booking.bookedSeats.forEach(seat => {
            delete showData.occupiedSeats[seat];
        });
        showData.markModified('occupiedSeats');
        await showData.save();

        res.json({
            success: true,
            message: `Booking cancelled. Refund: ₹${refundAmount} (${refundPercentage}%)`,
            refundAmount,
            refundPercentage
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
