import Booking from '../models/bookingModel.js';
import Show from '../models/showModel.js';
import Movie from '../models/Movie.js';
import User from '../models/userModel.js';

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
    try {
        const { period = 'week' } = req.query; // week, month, year

        let startDate = new Date();
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const bookings = await Booking.find({
            createdAt: { $gte: startDate },
            isCancelled: false,
            isPaid: true
        }).populate({
            path: 'show',
            populate: { path: 'movie' }
        });

        // Group by date
        const revenueByDate = {};
        let totalRevenue = 0;
        let totalBookings = 0;

        bookings.forEach(booking => {
            const date = booking.createdAt.toISOString().split('T')[0];
            if (!revenueByDate[date]) {
                revenueByDate[date] = { revenue: 0, bookings: 0 };
            }
            revenueByDate[date].revenue += booking.amount;
            revenueByDate[date].bookings += 1;
            totalRevenue += booking.amount;
            totalBookings += 1;
        });

        // Convert to array format for charts
        const chartData = Object.keys(revenueByDate).sort().map(date => ({
            date,
            revenue: revenueByDate[date].revenue,
            bookings: revenueByDate[date].bookings
        }));

        res.json({
            success: true,
            analytics: {
                totalRevenue,
                totalBookings,
                averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
                chartData,
                period
            }
        });
    } catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get occupancy analytics
export const getOccupancyAnalytics = async (req, res) => {
    try {
        const shows = await Show.find().populate('movie theater');

        const analytics = shows.map(show => {
            const totalSeats = 120; // Standard theater capacity (can be dynamic)
            const occupiedCount = show.occupiedSeats ? Object.keys(show.occupiedSeats).length : 0;
            const occupancyRate = (occupiedCount / totalSeats) * 100;

            return {
                showId: show._id,
                movie: show.movie?.title,
                theater: show.theater?.name,
                date: show.date,
                time: show.time,
                occupiedSeats: occupiedCount,
                totalSeats,
                occupancyRate: occupancyRate.toFixed(2),
                availableSeats: totalSeats - occupiedCount
            };
        });

        // Calculate average occupancy
        const avgOccupancy = analytics.length > 0
            ? analytics.reduce((sum, s) => sum + parseFloat(s.occupancyRate), 0) / analytics.length
            : 0;

        res.json({
            success: true,
            analytics: {
                shows: analytics,
                averageOccupancy: avgOccupancy.toFixed(2),
                totalShows: analytics.length
            }
        });
    } catch (error) {
        console.error('Occupancy analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get peak booking times
export const getPeakTimes = async (req, res) => {
    try {
        const bookings = await Booking.find({
            isCancelled: false
        });

        const hourCounts = {};
        const dayCounts = {};

        bookings.forEach(booking => {
            const hour = new Date(booking.createdAt).getHours();
            const day = new Date(booking.createdAt).getDay();

            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const peakHour = Object.keys(hourCounts).reduce((a, b) =>
            hourCounts[a] > hourCounts[b] ? a : b, 0
        );

        const peakDay = Object.keys(dayCounts).reduce((a, b) =>
            dayCounts[a] > dayCounts[b] ? a : b, 0
        );

        res.json({
            success: true,
            analytics: {
                peakHour: `${peakHour}:00 - ${parseInt(peakHour) + 1}:00`,
                peakDay: dayNames[peakDay],
                hourlyDistribution: Object.keys(hourCounts).map(hour => ({
                    hour: `${hour}:00`,
                    bookings: hourCounts[hour]
                })),
                dailyDistribution: Object.keys(dayCounts).map(day => ({
                    day: dayNames[day],
                    bookings: dayCounts[day]
                }))
            }
        });
    } catch (error) {
        console.error('Peak times error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get genre/language popularity
export const getPopularityAnalytics = async (req, res) => {
    try {
        const bookings = await Booking.find({
            isCancelled: false
        }).populate({
            path: 'show',
            populate: { path: 'movie' }
        });

        const genreCounts = {};
        const languageCounts = {};

        bookings.forEach(booking => {
            if (booking.show?.movie) {
                const movie = booking.show.movie;

                // Count genres
                if (movie.genres && Array.isArray(movie.genres)) {
                    movie.genres.forEach(genre => {
                        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                    });
                }

                // Count languages
                if (movie.language) {
                    languageCounts[movie.language] = (languageCounts[movie.language] || 0) + 1;
                }
            }
        });

        res.json({
            success: true,
            analytics: {
                genres: Object.keys(genreCounts).map(genre => ({
                    genre,
                    bookings: genreCounts[genre]
                })).sort((a, b) => b.bookings - a.bookings),
                languages: Object.keys(languageCounts).map(language => ({
                    language,
                    bookings: languageCounts[language]
                })).sort((a, b) => b.bookings - a.bookings)
            }
        });
    } catch (error) {
        console.error('Popularity analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user demographics
export const getUserDemographics = async (req, res) => {
    try {
        const users = await User.find();
        const bookings = await Booking.find({ isCancelled: false });

        const userBookingCounts = {};
        bookings.forEach(booking => {
            userBookingCounts[booking.user] = (userBookingCounts[booking.user] || 0) + 1;
        });

        // Categorize users
        const newUsers = users.filter(u => !userBookingCounts[u._id]).length;
        const regularUsers = Object.values(userBookingCounts).filter(count => count >= 2 && count < 5).length;
        const frequentUsers = Object.values(userBookingCounts).filter(count => count >= 5).length;

        res.json({
            success: true,
            analytics: {
                totalUsers: users.length,
                activeUsers: Object.keys(userBookingCounts).length,
                newUsers,
                regularUsers,
                frequentUsers,
                averageBookingsPerUser: bookings.length / (users.length || 1)
            }
        });
    } catch (error) {
        console.error('User demographics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalBookings,
            todayBookings,
            totalRevenue,
            totalUsers,
            totalMovies,
            totalShows
        ] = await Promise.all([
            Booking.countDocuments({ isCancelled: false }),
            Booking.countDocuments({
                isCancelled: false,
                createdAt: { $gte: today }
            }),
            Booking.aggregate([
                { $match: { isCancelled: false, isPaid: true } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments(),
            Movie.countDocuments(),
            Show.countDocuments()
        ]);

        res.json({
            success: true,
            summary: {
                totalBookings,
                todayBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalUsers,
                totalMovies,
                totalShows
            }
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
