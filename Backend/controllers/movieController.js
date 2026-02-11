import Movie from "../models/Movie.js";
import Show from "../models/showModel.js";
import Theater from "../models/Theater.js"; // Import Theater model

// Helper to create default shows for a movie
const createDefaultShows = async (movieId) => {
    // FIND A DEFAULT THEATER
    const defaultTheater = await Theater.findOne();
    if (!defaultTheater) {
        console.warn("No theater found. Cannot auto-schedule shows.");
        return;
    }

    // Default settings
    const defaultTimes = ["10:00", "13:00", "16:00", "19:00", "22:00"];
    const daysToSchedule = 30; // Schedule for next 30 days
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
                showDateTime: new Date(`${dateStr}T${time}:00`), // Store as proper Date object
                date: dateStr, // Legacy if needed
                time: time,     // Legacy if needed
                priceStandard,
                pricePremium,
                priceVIP,
                occupiedSeats: {}
            });
        });
    }

    // Use insertMany for efficiency
    if (showsToCreate.length > 0) {
        await Show.insertMany(showsToCreate);
    }
};

// ✅ Get all movies
export const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ success: true, movies });
    } catch (error) {
        console.error("Error fetching movies:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Get movie by ID
export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await Movie.findById(id);

        if (!movie) {
            return res.json({ success: false, message: "Movie not found" });
        }

        res.json({ success: true, movie });
    } catch (error) {
        console.error("Error fetching movie:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Add new movie (Admin only)
export const addMovie = async (req, res) => {
    try {
        const {
            title,
            description,
            posterUrl,
            backdropUrl,
            duration,
            language,
            genres,
            releaseDate,
            ticketPrice,
            rating,
            casts
        } = req.body;

        // Validate required fields
        if (!title || !description || !posterUrl || !duration || !releaseDate || !ticketPrice) {
            return res.json({ success: false, message: "Please fill all required fields" });
        }

        const movie = await Movie.create({
            title,
            description,
            posterUrl,
            backdropUrl: backdropUrl || posterUrl,
            duration,
            language: language || "Hindi",
            genres: genres || [],
            releaseDate,
            ticketPrice,
            rating: rating || 0,
            casts: casts || []
        });

        // ⭐ AUTO-CREATE SHOWS
        await createDefaultShows(movie._id);

        res.json({ success: true, message: "Movie added and shows scheduled successfully", movie });
    } catch (error) {
        console.error("Error adding movie:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Update movie (Admin only)
export const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const movie = await Movie.findByIdAndUpdate(id, updateData, { new: true });

        if (!movie) {
            return res.json({ success: false, message: "Movie not found" });
        }

        res.json({ success: true, message: "Movie updated successfully", movie });
    } catch (error) {
        console.error("Error updating movie:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Delete movie (Admin only)
export const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        // Also delete associated shows
        await Show.deleteMany({ movie: id });

        const movie = await Movie.findByIdAndDelete(id);

        if (!movie) {
            return res.json({ success: false, message: "Movie not found" });
        }

        res.json({ success: true, message: "Movie and associated shows deleted successfully" });
    } catch (error) {
        console.error("Error deleting movie:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Add dummy movies for initial setup (Admin only)
export const addDummyMovies = async (req, res) => {
    try {
        const dummyMovies = [
            // Indian Movies
            {
                title: "Pathaan",
                description: "An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target his homeland. A high-octane action thriller with stunning visuals and intense sequences.",
                posterUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1200",
                duration: 146,
                language: "Hindi",
                genres: ["Action", "Thriller", "Adventure"],
                releaseDate: new Date("2023-01-25"),
                ticketPrice: 250,
                rating: 7.8,
                casts: ["Shah Rukh Khan", "Deepika Padukone", "John Abraham"],
                category: "Indian"
            },
            {
                title: "Jawan",
                description: "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society. An adrenaline-pumping revenge saga.",
                posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200",
                duration: 169,
                language: "Hindi",
                genres: ["Action", "Thriller", "Drama"],
                releaseDate: new Date("2023-09-07"),
                ticketPrice: 300,
                rating: 8.2,
                casts: ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi"],
                category: "Indian"
            },
            {
                title: "Gadar 2",
                description: "During the Indo-Pakistani War of 1971, Tara Singh returns to Pakistan to bring his son Charanjeet back home. A powerful sequel to the iconic love story set against war.",
                posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200",
                duration: 170,
                language: "Hindi",
                genres: ["Action", "Drama", "Romance"],
                releaseDate: new Date("2023-08-11"),
                ticketPrice: 200,
                rating: 7.5,
                casts: ["Sunny Deol", "Ameesha Patel", "Utkarsh Sharma"],
                category: "Indian"
            },
            {
                title: "Animal",
                description: "The hardened son of a powerful industrialist returns home to seek revenge against those threatening his father's life. A dark and intense character study.",
                posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200",
                duration: 201,
                language: "Hindi",
                genres: ["Action", "Crime", "Drama"],
                releaseDate: new Date("2023-12-01"),
                ticketPrice: 350,
                rating: 8.5,
                casts: ["Ranbir Kapoor", "Rashmika Mandanna", "Anil Kapoor"],
                category: "Indian"
            },
            {
                title: "Pushpa 2: The Rule",
                description: "Pushpa struggles to sustain his sandalwood smuggling business amidst the threats of his enemies and police. An epic continuation of the Pushpa saga.",
                posterUrl: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=1200",
                duration: 175,
                language: "Telugu",
                genres: ["Action", "Crime", "Drama"],
                releaseDate: new Date("2024-08-15"),
                ticketPrice: 300,
                rating: 8.7,
                casts: ["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"],
                category: "Indian"
            },
            {
                title: "RRR",
                description: "A fictional story of two revolutionary freedom fighters in the 1970s. An epic period drama with breathtaking action sequences.",
                posterUrl: "https://images.unsplash.com/photo-1574267432644-f74c8b3ac0e9?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1574267432644-f74c8b3ac0e9?w=1200",
                duration: 187,
                language: "Telugu",
                genres: ["Action", "Drama", "Historical"],
                releaseDate: new Date("2022-03-25"),
                ticketPrice: 280,
                rating: 8.9,
                casts: ["N. T. Rama Rao Jr.", "Ram Charan", "Alia Bhatt"],
                category: "Indian"
            },
            {
                title: "KGF Chapter 2",
                description: "The blood-soaked land of Kolar Gold Fields has a new overlord. Rocky's name strikes fear in his foes and his allies too.",
                posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200",
                duration: 168,
                language: "Kannada",
                genres: ["Action", "Crime", "Drama"],
                releaseDate: new Date("2022-04-14"),
                ticketPrice: 270,
                rating: 8.4,
                casts: ["Yash", "Sanjay Dutt", "Raveena Tandon"],
                category: "Indian"
            },
            {
                title: "Salaar",
                description: "A gang leader tries to keep a promise made to his dying friend and takes on the other criminal gangs.",
                posterUrl: "https://images.unsplash.com/photo-1560109947-543149eceb16?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1560109947-543149eceb16?w=1200",
                duration: 175,
                language: "Telugu",
                genres: ["Action", "Crime", "Thriller"],
                releaseDate: new Date("2023-12-22"),
                ticketPrice: 320,
                rating: 8.0,
                casts: ["Prabhas", "Prithviraj Sukumaran", "Shruti Haasan"],
                category: "Indian"
            },

            // Hollywood Movies
            {
                title: "Oppenheimer",
                description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
                posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0b11?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0b11?w=1200",
                duration: 180,
                language: "English",
                genres: ["Biography", "Drama", "History"],
                releaseDate: new Date("2023-07-21"),
                ticketPrice: 350,
                rating: 8.8,
                casts: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
                category: "Hollywood"
            },
            {
                title: "Barbie",
                description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
                posterUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200",
                duration: 114,
                language: "English",
                genres: ["Adventure", "Comedy", "Fantasy"],
                releaseDate: new Date("2023-07-21"),
                ticketPrice: 300,
                rating: 7.5,
                casts: ["Margot Robbie", "Ryan Gosling", "Will Ferrell"],
                category: "Hollywood"
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
                posterUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1200",
                duration: 140,
                language: "English",
                genres: ["Animation", "Action", "Adventure"],
                releaseDate: new Date("2023-06-02"),
                ticketPrice: 280,
                rating: 8.9,
                casts: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
                category: "Hollywood"
            },
            {
                title: "Dune: Part Two",
                description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200",
                duration: 166,
                language: "English",
                genres: ["Action", "Adventure", "Drama"],
                releaseDate: new Date("2024-03-01"),
                ticketPrice: 380,
                rating: 8.6,
                casts: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
                category: "Hollywood"
            },
            {
                title: "Guardians of the Galaxy Vol. 3",
                description: "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and one of their own.",
                posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200",
                duration: 150,
                language: "English",
                genres: ["Action", "Adventure", "Comedy"],
                releaseDate: new Date("2023-05-05"),
                ticketPrice: 320,
                rating: 8.1,
                casts: ["Chris Pratt", "Zoe Saldana", "Dave Bautista"],
                category: "Hollywood"
            },
            {
                title: "Mission: Impossible - Dead Reckoning",
                description: "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity if it falls into the wrong hands.",
                posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200",
                duration: 163,
                language: "English",
                genres: ["Action", "Adventure", "Thriller"],
                releaseDate: new Date("2023-07-12"),
                ticketPrice: 350,
                rating: 8.0,
                casts: ["Tom Cruise", "Hayley Atwell", "Ving Rhames"],
                category: "Hollywood"
            },
            {
                title: "The Batman",
                description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
                posterUrl: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=1200",
                duration: 176,
                language: "English",
                genres: ["Action", "Crime", "Drama"],
                releaseDate: new Date("2022-03-04"),
                ticketPrice: 300,
                rating: 8.2,
                casts: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
                category: "Hollywood"
            },
            {
                title: "Avatar: The Way of Water",
                description: "Jake Sully and Ney'tiri have formed a family and are doing everything to stay together. However, they must leave their home and explore the regions of Pandora.",
                posterUrl: "https://images.unsplash.com/photo-1574267432644-f74c8b3ac0e9?w=500",
                backdropUrl: "https://images.unsplash.com/photo-1574267432644-f74c8b3ac0e9?w=1200",
                duration: 192,
                language: "English",
                genres: ["Action", "Adventure", "Fantasy"],
                releaseDate: new Date("2022-12-16"),
                ticketPrice: 400,
                rating: 7.9,
                casts: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
                category: "Hollywood"
            }
        ];

        // Check which movies already exist
        const newMovies = [];
        for (const movie of dummyMovies) {
            const exists = await Movie.findOne({ title: movie.title });
            if (!exists) {
                newMovies.push(movie);
            }
        }

        if (newMovies.length === 0) {
            return res.json({
                success: true,
                message: "All dummy movies already exist in database."
            });
        }

        const movies = await Movie.insertMany(newMovies);

        // ⭐ AUTO-CREATE SHOWS FOR THESE NEW MOVIES
        for (const movie of movies) {
            await createDefaultShows(movie._id);
        }

        res.json({
            success: true,
            message: `${movies.length} new dummy movies added successfully`,
            movies
        });
    } catch (error) {
        console.error("Error adding dummy movies:", error.message);
        res.json({ success: false, message: error.message });
    }
};


// Seed trending movies (Temporary)
export const seedTrendingMovies = async (req, res) => {
    try {
        const movies = await Movie.find().limit(6);
        if (movies.length === 0) return res.json({ success: false, message: "No movies found" });

        const ids = movies.map(m => m._id);
        await Movie.updateMany({ _id: { $in: ids } }, { $set: { isTrending: true } });

        res.json({ success: true, message: `Updated ${movies.length} movies to trending` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
