import Show from "../models/showModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import Theater from "../models/Theater.js";

// Check if user is admin and return role
export const isAdmin = async (req, res) => {
  try {
    // req.userRole is set by protectAdmin middleware
    let role = req.userRole;
    
    console.log(`🔍 [isAdmin Check] UID: ${req.auth?.userId} | Middleware Role: ${role}`);

    // Fallback if role is not set yet (should not happen with protectAdmin)
    if (!role) {
      const { userId } = req.auth;
      if (userId) {
        const dbUser = await User.findById(userId);
        role = dbUser?.role || 'user';
        console.log(`   🔸 Fallback DB Role: ${role}`);
      } else {
        role = 'user';
        console.log(`   🔸 No Auth User - Defaulting to 'user'`);
      }
    }
    
    const isAdminOrSuper = role === 'admin' || role === 'superadmin';
    
    res.json({ 
      success: true, 
      isAdmin: isAdminOrSuper,
      role: role,
      isSuperAdmin: role === 'superadmin'
    });
  } catch (error) {
    console.error("isAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Data (scoped for admins, full for superadmin)
export const getDashboardData = async (req, res) => {
  try {
    const Support = (await import('../models/supportModel.js')).default;
    const Movie = (await import('../models/Movie.js')).default;

    const { userId } = req.auth;
    const dbUser = await User.findById(userId);
    const userRole = dbUser?.role || 'user';

    // For admins, scope to their theaters only
    let theaterFilter = {};
    let theaterIds = [];
    
    if (userRole === 'admin') {
      const myTheaters = await Theater.find({ owner: userId }).select('_id');
      theaterIds = myTheaters.map(t => t._id);
      theaterFilter = { theater: { $in: theaterIds } };
    }

    // Get total users from Clerk (superadmin only)
    let totalUser = 0;
    if (userRole === 'superadmin') {
      try {
        const { clerkClient } = await import('@clerk/express');
        const userList = await clerkClient.users.getUserList({ limit: 500 });
        totalUser = userList.totalCount || userList.data?.length || 0;
      } catch (clerkError) {
        totalUser = await User.countDocuments();
      }
    }

    // Build show filter
    const showDateFilter = { showDateTime: { $gte: new Date() } };
    const showFilter = userRole === 'admin' 
      ? { ...showDateFilter, ...theaterFilter }
      : showDateFilter;

    // Build booking filter
    const bookingBaseFilter = { isPaid: true };

    // Execute queries
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
      // Unique movies with active shows
      Show.aggregate([
        { $match: showFilter },
        { $group: { _id: "$movie" } },
        { $lookup: { from: "movies", localField: "_id", foreignField: "_id", as: "movieDetails" } },
        { $unwind: "$movieDetails" },
        { $project: { _id: "$movieDetails._id", movie: "$movieDetails" } }
      ]),
      // Revenue
      userRole === 'admin'
        ? Booking.aggregate([
            { $match: bookingBaseFilter },
            { $lookup: { from: 'shows', localField: 'show', foreignField: '_id', as: 'showData' } },
            { $unwind: '$showData' },
            { $match: { 'showData.theater': { $in: theaterIds } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ])
        : Booking.aggregate([
            { $match: bookingBaseFilter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
      // Bookings count
      userRole === 'admin'
        ? (async () => {
            const result = await Booking.aggregate([
              { $match: bookingBaseFilter },
              { $lookup: { from: 'shows', localField: 'show', foreignField: '_id', as: 'showData' } },
              { $unwind: '$showData' },
              { $match: { 'showData.theater': { $in: theaterIds } } },
              { $count: 'count' }
            ]);
            return result[0]?.count || 0;
          })()
        : Booking.countDocuments(bookingBaseFilter),
      // Active shows
      Show.countDocuments(showFilter),
      // Support
      userRole === 'superadmin' ? Support.countDocuments({ status: 'Open' }) : 0,
      userRole === 'superadmin' ? Support.countDocuments({ status: 'In Progress' }) : 0,
      userRole === 'superadmin' ? Support.countDocuments({ status: 'Resolved' }) : 0,
      // Theaters
      userRole === 'admin' ? Theater.countDocuments({ owner: userId }) : Theater.countDocuments(),
      // Movies
      Movie.countDocuments(),
      // Popular movies
      Booking.aggregate([
        { $match: bookingBaseFilter },
        { $lookup: { from: 'shows', localField: 'show', foreignField: '_id', as: 'showData' } },
        { $unwind: '$showData' },
        ...(userRole === 'admin' ? [{ $match: { 'showData.theater': { $in: theaterIds } } }] : []),
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
        { $project: { movie: '$movieDetails', bookingCount: 1, revenue: 1 } }
      ]),
      // Recent bookings
      userRole === 'admin'
        ? (async () => {
            const shows = await Show.find({ theater: { $in: theaterIds } }).select('_id');
            const showIds = shows.map(s => s._id);
            return Booking.find({ isPaid: true, show: { $in: showIds } })
              .populate({ path: 'show', populate: { path: 'movie' } })
              .sort({ createdAt: -1 })
              .limit(10)
              .select('amount createdAt contactDetails show');
          })()
        : Booking.find({ isPaid: true })
            .populate({ path: 'show', populate: { path: 'movie' } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('amount createdAt contactDetails show'),
      // Revenue by method
      Booking.aggregate([
        { $match: bookingBaseFilter },
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
      totalBookings: bookingsCount,
      totalRevenue: revenueData[0]?.total || 0,
      activeShows: uniqueMovies,
      activeShowsCount: activeShowsCount,
      totalUser,
      userRole,
      support: {
        pending: pendingSupport,
        processing: processingSupport,
        solved: solvedSupport,
        total: pendingSupport + processingSupport + solvedSupport
      },
      theaters: { total: totalTheaters },
      movies: { total: totalMovies },
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

// Get all shows (scoped for admin)
export const getAllShows = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findById(userId);
    
    let filter = { showDateTime: { $gte: new Date() } };
    
    if (dbUser?.role === 'admin') {
      const myTheaters = await Theater.find({ owner: userId }).select('_id');
      const theaterIds = myTheaters.map(t => t._id);
      filter.theater = { $in: theaterIds };
    }

    const shows = await Show.find(filter)
      .populate("movie")
      .populate("theater")
      .sort({ showDateTime: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    console.error("getAllShows error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings (scoped for admin)
export const getAllBookings = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findById(userId);

    let bookings;

    if (dbUser?.role === 'admin') {
      const myTheaters = await Theater.find({ owner: userId }).select('_id');
      const theaterIds = myTheaters.map(t => t._id);
      const shows = await Show.find({ theater: { $in: theaterIds } }).select('_id');
      const showIds = shows.map(s => s._id);
      
      bookings = await Booking.find({ show: { $in: showIds } })
        .populate("user")
        .populate({ path: "show", populate: [{ path: "movie" }, { path: "theater" }] })
        .sort({ createdAt: -1 })
        .limit(50);
    } else {
      bookings = await Booking.find({})
        .populate("user")
        .populate({ path: "show", populate: { path: "movie" } })
        .sort({ createdAt: -1 })
        .limit(50);
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all admins (Super Admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    
    // Get theater count for each admin
    const adminsWithTheaters = await Promise.all(
      admins.map(async (admin) => {
        const theaterCount = await Theater.countDocuments({ owner: admin._id });
        return {
          ...admin.toObject(),
          theaterCount
        };
      })
    );

    res.json({ success: true, admins: adminsWithTheaters });
  } catch (error) {
    console.error("getAllAdmins error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove admin role (Super Admin only)
export const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.role !== 'admin') {
      return res.json({ success: false, message: "User is not an admin" });
    }

    user.role = 'user';
    await user.save();

    // Send notification
    const Notification = (await import('../models/notificationModel.js')).default;
    await Notification.create({
      user: id,
      type: 'admin_application',
      title: 'Admin Access Revoked',
      message: 'Your admin access has been revoked by the Super Admin.',
    });

    res.json({ success: true, message: "Admin role removed successfully" });
  } catch (error) {
    console.error("removeAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
