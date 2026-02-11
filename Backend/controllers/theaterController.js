import Theater from "../models/Theater.js";
import Show from "../models/showModel.js";
import Movie from "../models/Movie.js";

export const getLocations = async (req, res) => {
    try {
        // Aggregate to find unique cities stored in theaters
        const locations = await Theater.aggregate([
            {
                $group: {
                    _id: { state: "$state", city: "$city" }
                }
            },
            {
                $project: {
                    _id: 0,
                    state: "$_id.state",
                    city: "$_id.city"
                }
            },
            { $sort: { city: 1 } }
        ]);

        res.status(200).json({ success: true, locations });
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getTheatersByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const theaters = await Theater.find({ city, isActive: true });
        res.status(200).json({ success: true, theaters });
    } catch (error) {
        console.error("Error fetching theaters:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getShowsByCity = async (req, res) => {
    try {
        const { city } = req.params;

        // 1. Find all theaters in this city
        const theaters = await Theater.find({ city, isActive: true }).distinct('_id');

        // 2. Find all shows playing in these theaters
        // Populate movie and theater details
        const shows = await Show.find({
            theater: { $in: theaters },
            showDateTime: { $gt: new Date() }
        })
            .populate('movie', 'title posterUrl language genre rating duration')
            .populate('theater', 'name location facilities')
            .sort({ showDateTime: 1 });

        // 3. Group by Movie
        const moviesMap = {};

        shows.forEach(show => {
            const movieId = show.movie._id.toString();

            if (!moviesMap[movieId]) {
                moviesMap[movieId] = {
                    ...show.movie.toObject(),
                    shows: []
                };
            }

            // Organize shows by Theater within the movie
            // Check if theater already exists in this movie's list
            let theaterEntry = moviesMap[movieId].shows.find(t => t.theater._id.toString() === show.theater._id.toString());

            if (!theaterEntry) {
                theaterEntry = {
                    theater: show.theater,
                    timings: []
                };
                moviesMap[movieId].shows.push(theaterEntry);
            }

            theaterEntry.timings.push({
                showId: show._id,
                time: show.showDateTime,
                price: {
                    standard: show.priceStandard,
                    premium: show.pricePremium,
                    vip: show.priceVIP
                }
            });
        });

        res.status(200).json({ success: true, movies: Object.values(moviesMap) });

    } catch (error) {
        console.error("Error fetching shows by city:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getShowsByTheater = async (req, res) => {
    try {
        const { theaterId } = req.params;

        // 1. Find the theater
        const theater = await Theater.findById(theaterId);
        if (!theater) {
            return res.status(404).json({ success: false, message: "Theater not found" });
        }

        // 2. Find shows
        const shows = await Show.find({
            theater: theaterId,
            showDateTime: { $gt: new Date() }
        })
            .populate('movie', 'title posterUrl language genres rating duration')
            .sort({ showDateTime: 1 });

        // 3. Group by Movie
        const moviesMap = {};

        shows.forEach(show => {
            const movieId = show.movie._id.toString();

            if (!moviesMap[movieId]) {
                moviesMap[movieId] = {
                    ...show.movie.toObject(),
                    shows: []
                };
            }

            moviesMap[movieId].shows.push({
                showId: show._id,
                time: show.showDateTime,
                price: {
                    standard: show.priceStandard,
                    premium: show.pricePremium,
                    vip: show.priceVIP
                }
            });
        });

        res.status(200).json({ success: true, theater, movies: Object.values(moviesMap) });

    } catch (error) {
        console.error("Error fetching shows by theater:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const addTheater = async (req, res) => {
    try {
        const { name, city, state, location, image, facilities } = req.body;

        if (!name || !city || !state || !location || !image) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const theater = await Theater.create({
            name,
            city,
            state,
            location,
            image,
            facilities: facilities || []
        });

        res.json({ success: true, message: "Theater added successfully", theater });
    } catch (error) {
        console.error("Error adding theater:", error);
        res.json({ success: false, message: error.message });
    }
};
