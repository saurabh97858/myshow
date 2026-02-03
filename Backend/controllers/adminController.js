import Show from "../models/showModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";

// Check if user is admin
export const isAdmin = async (req, res) => {
  try {
    res.json({ success: true, isAdmin: true });
  } catch (error) {
    console.error("isAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    // Execute queries in parallel for performance
    const [totalUser, uniqueMovies, revenueData, bookingsCount, activeShowsCount] = await Promise.all([
      User.countDocuments(),
      // Efficiently find unique movies with active shows
      Show.aggregate([
        { $match: { showDateTime: { $gte: new Date() } } },
        { $group: { _id: "$movie" } }, // Group by movie ID to get unique movies
        { $lookup: { from: "movies", localField: "_id", foreignField: "_id", as: "movieDetails" } }, // Populate movie details
        { $unwind: "$movieDetails" },
        { $project: { _id: "$movieDetails._id", movie: "$movieDetails" } } // Format to match frontend expectation
      ]),
      Booking.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Booking.countDocuments({ isPaid: true }),
      Show.countDocuments({ showDateTime: { $gte: new Date() } })
    ]);

    const dashboardData = {
      totalBookings: bookingsCount,
      totalRevenue: revenueData[0]?.total || 0,
      activeShows: uniqueMovies, // Send unique movies list directly
      activeShowsCount: activeShowsCount, // Send total count explicitly
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error("getDashboardData error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    console.error("getAllShows error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    // Limit to 50 most recent bookings for performance
    const bookings = await Booking.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
