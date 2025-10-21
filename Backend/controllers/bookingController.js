import Show from "../models/showModel.js";   // ✅ filename fix
import Booking from "../models/bookingModel.js"; // ✅ filename fix

// Function to check availability of selected seats
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId); // ✅ use Show, not showId
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
        const { userId } = req.auth(); // ✅ ensure auth middleware provides this
        const { showId, selectedSeats } = req.body;

        // check if seats are available
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if (!isAvailable) {
            return res.json({ success: false, message: "Selected seats are not available." });
        }

        // get show details
        const showData = await Show.findById(showId).populate('movie');

        // create booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        });

        // mark seats as occupied
        selectedSeats.forEach(seat => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified('occupiedSeats');
        await showData.save();

        res.json({ success: true, message: "Booked successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message }); // ✅ show actual error
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
