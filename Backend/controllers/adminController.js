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
    // Import dependencies
    const Support = (await import('../models/supportModel.js')).default;
    const Theater = (await import('../models/Theater.js')).default;
    const Movie = (await import('../models/Movie.js')).default;

    // Get total users from Clerk
    let totalUser = 0;
    try {
      const { clerkClient } = await import('@clerk/express');
      const userList = await clerkClient.users.getUserList({ limit: 500 });
      totalUser = userList.totalCount || userList.data?.length || 0;
    } catch (clerkError) {
      console.error("Clerk user count error:", clerkError.message);
      // Fallback to MongoDB count if Clerk fails
      totalUser = await User.countDocuments();
    }

    // Execute all queries in parallel for performance
    const [
      uniqueMovies,
      revenueData,
      bookingsCount,
      activeShowsCount,
      pendingSupport,
      processingSupport,
      solvedSupport,
      totalTheaters,
      totalMovies,
      popularMovies,
      recentBookings,
      revenueByMethod
    ] = await Promise.all([
      // Efficiently find unique movies with active shows
      Show.aggregate([
        { $match: { showDateTime: { $gte: new Date() } } },
        { $group: { _id: "$movie" } },
        { $lookup: { from: "movies", localField: "_id", foreignField: "_id", as: "movieDetails" } },
        { $unwind: "$movieDetails" },
        { $project: { _id: "$movieDetails._id", movie: "$movieDetails" } }
      ]),
      // Total revenue from paid bookings
      Booking.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      // Total paid bookings count
      Booking.countDocuments({ isPaid: true }),
      // Active shows count
      Show.countDocuments({ showDateTime: { $gte: new Date() } }),
      // Support tickets - Pending
      Support.countDocuments({ status: 'Open' }),
      // Support tickets - In Processing
      Support.countDocuments({ status: 'In Progress' }),
      // Support tickets - Solved
      Support.countDocuments({ status: 'Resolved' }),
      // Total theaters
      Theater.countDocuments(),
      // Total movies
      Movie.countDocuments(),
      // Popular movies (most bookings)
      Booking.aggregate([
        { $match: { isPaid: true } },
        { $lookup: { from: 'shows', localField: 'show', foreignField: '_id', as: 'showData' } },
        { $unwind: '$showData' },
        {
          $group: {
            _id: '$showData.movie',
            bookingCount: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movieDetails' } },
        { $unwind: '$movieDetails' },
        {
          $project: {
            movie: '$movieDetails',
            bookingCount: 1,
            revenue: 1
          }
        }
      ]),
      // Recent bookings (last 10)
      Booking.find({ isPaid: true })
        .populate({ path: 'show', populate: { path: 'movie' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('amount createdAt contactDetails show'),
      // Revenue by payment method
      Booking.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: '$paymentDetails.method',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const dashboardData = {
      // Existing core metrics
      totalBookings: bookingsCount,
      totalRevenue: revenueData[0]?.total || 0,
      activeShows: uniqueMovies,
      activeShowsCount: activeShowsCount,
      totalUser,

      // New analytics
      support: {
        pending: pendingSupport,
        processing: processingSupport,
        solved: solvedSupport,
        total: pendingSupport + processingSupport + solvedSupport
      },
      theaters: {
        total: totalTheaters
      },
      movies: {
        total: totalMovies
      },
      popularMovies: popularMovies || [],
      recentBookings: recentBookings || [],
      revenueByMethod: revenueByMethod || []
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
