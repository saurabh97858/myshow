import Movie from "../models/Movie.js";
import Show from "../models/showModel.js";
import Theater from "../models/Theater.js"; // Import Theater model

// ✅ Add a show
export const addShow = async (req, res) => {
  try {
    const { movieId, theaterId, showsInput, priceStandard, pricePremium, priceVIP } = req.body;
    const { userId } = req.auth;

    if (!theaterId) {
      return res.json({ success: false, message: "Theater ID is required" });
    }

    // Verify theater exists and belongs to this admin (or user is superadmin)
    const theater = await Theater.findById(theaterId);
    if (!theater) {
      return res.json({ success: false, message: "Theater not found" });
    }

    const { dbUser } = req; // Added by protectAdmin middleware if we populate it, but let's query just in case
    const dbUserCheck = (await import("../models/userModel.js")).default;
    const userRole = await dbUserCheck.findById(userId).select('role');
    
    if (userRole?.role !== 'superadmin' && theater.owner !== userId) {
      return res.json({ success: false, message: "You can only add shows to your own theaters" });
    }

    // Check if movie exists in DB
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.json({ success: false, message: "Movie not found in database" });
    }

    // Create shows with new price structure
    const showsToCreate = showsInput.map(({ date, time }) => ({
      movie: movieId,
      theater: theaterId,
      showDateTime: new Date(`${date}T${time}`),
      priceStandard: priceStandard || 100,
      pricePremium: pricePremium || 200,
      priceVIP: priceVIP || 300,
      occupiedSeats: {},
    }));

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show added successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get all upcoming shows
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // Filter out shows where movie population failed
    const validShows = shows.filter(show => show.movie && show.movie._id);

    const uniqueShowsMap = new Map();
    validShows.forEach((show) => {
      const movieId = show.movie._id.toString();
      if (!uniqueShowsMap.has(movieId)) uniqueShowsMap.set(movieId, show);
    });

    res.json({ success: true, shows: Array.from(uniqueShowsMap.values()) });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Helper to create default shows for a movie (Lazy Initialization)
const createDefaultShows = async (movieId) => {
  // FIND A DEFAULT THEATER
  // We'll pick the first available theater to assign these auto-generated shows to.
  const defaultTheater = await Theater.findOne();

  if (!defaultTheater) {
    console.warn("No theater found. Cannot auto-schedule shows.");
    return; // Better to return than crash, though shows won't be created.
  }

  // Default settings
  const defaultTimes = ["10:00", "13:00", "16:00", "19:00", "22:00"];
  const daysToSchedule = 7; // Schedule for next 7 days (Ultra-Fast Performance)
  const priceStandard = 150;
  const pricePremium = 250;
  const priceVIP = 400;

  const today = new Date();
  const showsToCreate = [];

  for (let i = 0; i < daysToSchedule; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    defaultTimes.forEach(time => {
      showsToCreate.push({
        movie: movieId,
        theater: defaultTheater._id, // Assign the theater ID
        showDateTime: new Date(`${dateStr}T${time}:00`),
        date: dateStr, // Legacy support
        time: time,     // Legacy support
        priceStandard,
        pricePremium,
        priceVIP,
        occupiedSeats: {},
      });
    });
  }

  if (showsToCreate.length > 0) {
    await Show.insertMany(showsToCreate);
  }
};

// ✅ Get single show by movieId
export const getShow = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.params.id;
    if (!movieId) return res.json({ success: false, message: "Movie ID required" });

    const movie = await Movie.findById(movieId);
    if (!movie) return res.json({ success: false, message: "Movie not found" });

    let shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } }).lean();

    // ⭐ Lazy Load: If no upcoming shows exist, create them for the next 7 days (Fast Mode).
    // This ensures movies are always bookable even if previous shows expired.
    if (shows.length === 0) {
      console.time("Auto-Schedule");
      console.log(`No upcoming shows found for ${movie.title}. Auto-generating fast schedule (7 days)...`);
      await createDefaultShows(movieId);
      console.timeEnd("Auto-Schedule");

      // Re-fetch the newly created shows
      shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } }).lean();
    }

    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime.toISOString().split("T")[1].substring(0, 5),
        showId: show._id,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get show by showId (for seat selection)
export const getShowById = async (req, res) => {
  try {
    const { showId } = req.params;
    if (!showId) return res.json({ success: false, message: "Show ID required" });

    const show = await Show.findById(showId).populate("movie").populate("theater");
    if (!show) return res.json({ success: false, message: "Show not found" });

    // Dynamic Pricing Logic (Feature 6)
    const showDate = new Date(show.showDateTime);
    const isWeekend = (showDate.getDay() === 0 || showDate.getDay() === 6);
    const hour = showDate.getHours();
    const isPrimeTime = (hour >= 18 && hour <= 22);
    
    let demandMultiplier = 1.0;
    if (isWeekend) demandMultiplier += 0.15; // 15% surge on weekends
    if (isPrimeTime) demandMultiplier += 0.10; // 10% surge in prime time

    // Format the show data with new price structure
    const formattedShow = {
      _id: show._id,
      movie: show.movie,
      theater: show.theater,
      showDateTime: show.showDateTime,
      priceStandard: Math.round((show.priceStandard || 100) * demandMultiplier),
      pricePremium: Math.round((show.pricePremium || 200) * demandMultiplier),
      priceVIP: Math.round((show.priceVIP || 300) * demandMultiplier),
      occupiedSeats: show.occupiedSeats,
      dynamicPricingApplied: demandMultiplier > 1,
      dateTime: [{
        time: show.showDateTime.toISOString().split("T")[1].substring(0, 5),
        showId: show._id,
      }],
    };

    res.json({ success: true, show: formattedShow });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
