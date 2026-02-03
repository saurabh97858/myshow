import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";
import Show from "./models/showModel.js";
import Theater from "./models/Theater.js";
import Booking from "./models/bookingModel.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to DB");

        // Sample movies with RELIABLE image URLs
        const sampleMovies = [
            // --- Bollywood ---
            {
                title: "Pushpa 2: The Rule",
                description: "Pushpa Raj continues his journey as a sandalwood smuggler. The sequel follows his rise and the challenges he faces against his enemies.",
                posterUrl: "https://image.tmdb.org/t/p/w500/bGLTnvSMRQ9N4W79TReHbS8rbDA.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/b7YiJMzDLumCE0AZg2n9sCxOgFg.jpg",
                duration: 180,
                language: "Telugu",
                genres: ["Action", "Drama", "Thriller"],
                releaseDate: new Date("2024-12-05"),
                ticketPrice: 350,
                rating: 8.9,
                casts: ["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"],
                category: "Indian"
            },
            {
                title: "Stree 2",
                description: "The ghostly woman returns to haunt the men of Chanderi once again. Can the town survive another supernatural encounter?",
                posterUrl: "https://image.tmdb.org/t/p/w500/aP21j3uRvk2qr6OOAjNh0XYjfWh.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/7w8SoOVU87R3mJQdU8DGHZtrMqZ.jpg",
                duration: 150,
                language: "Hindi",
                genres: ["Horror", "Comedy"],
                releaseDate: new Date("2024-08-15"),
                ticketPrice: 300,
                rating: 8.4,
                casts: ["Rajkummar Rao", "Shraddha Kapoor", "Pankaj Tripathi"],
                category: "Indian"
            },
            {
                title: "Animal",
                description: "A son's obsessive love for his father leads him down a dark and violent path of destruction.",
                posterUrl: "https://image.tmdb.org/t/p/w500/hr9rjR3J0xBBKmlJ4n3gHId9ccx.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/9n2tJBplPbgR2ca05hS5CKXwP2c.jpg",
                duration: 201,
                language: "Hindi",
                genres: ["Action", "Crime", "Drama"],
                releaseDate: new Date("2023-12-01"),
                ticketPrice: 340,
                rating: 7.0,
                casts: ["Ranbir Kapoor", "Anil Kapoor", "Bobby Deol"],
                category: "Indian"
            },
            {
                title: "Jawan",
                description: "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.",
                posterUrl: "https://image.tmdb.org/t/p/w500/jcdikYfH091vI67Q7a7rI6p3bY3.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/2e7j7X8A6f2k4m5q3w9h0n8r7.jpg",
                duration: 169,
                language: "Hindi",
                genres: ["Action", "Thriller"],
                releaseDate: new Date("2023-09-07"),
                ticketPrice: 280,
                rating: 7.2,
                casts: ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi"],
                category: "Indian"
            },
            {
                title: "Kalki 2898 AD",
                description: "In a dystopian future, a bounty hunter and a warrior must protect the unborn child prophesied to end the age of darkness.",
                posterUrl: "https://image.tmdb.org/t/p/w500/zsh4ggvjbWHaVdaISvL4GxNYJPZ.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/cLXpfJ2bMmXMPwcrOSJL1ykNzM2.jpg",
                duration: 181,
                language: "Telugu",
                genres: ["Action", "Sci-Fi", "Fantasy"],
                releaseDate: new Date("2024-06-27"),
                ticketPrice: 400,
                rating: 8.7,
                casts: ["Prabhas", "Deepika Padukone", "Amitabh Bachchan"],
                category: "Indian"
            },
            {
                title: "Singham Again",
                description: "The powerful cop Bajirao Singham returns with more action and drama in this epic sequel to the blockbuster franchise.",
                posterUrl: "https://image.tmdb.org/t/p/w500/lqoMzCcZYEFK729d6eq8kZlIxuz.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/gMJngTNfaqCSCqGD4y8lVMZXKDn.jpg",
                duration: 165,
                language: "Hindi",
                genres: ["Action", "Drama"],
                releaseDate: new Date("2024-11-01"),
                ticketPrice: 320,
                rating: 7.8,
                casts: ["Ajay Devgn", "Deepika Padukone", "Ranveer Singh"],
                category: "Indian"
            },

            // --- Hollywood ---
            {
                title: "Avatar: The Way of Water",
                description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
                posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
                duration: 192,
                language: "English",
                genres: ["Sci-Fi", "Adventure", "Action"],
                releaseDate: new Date("2022-12-16"),
                ticketPrice: 450,
                rating: 8.8,
                casts: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
                category: "Hollywood"
            },
            {
                title: "Avengers: Endgame",
                description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
                posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
                duration: 181,
                language: "English",
                genres: ["Adventure", "Sci-Fi", "Action"],
                releaseDate: new Date("2019-04-26"),
                ticketPrice: 380,
                rating: 9.0,
                casts: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"],
                category: "Hollywood"
            },
            {
                title: "Oppenheimer",
                description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
                posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/rLb2cs60836t5iDa4dPJAGa6hNw.jpg",
                duration: 180,
                language: "English",
                genres: ["Biography", "Drama", "History"],
                releaseDate: new Date("2023-07-21"),
                ticketPrice: 600,
                rating: 8.6,
                casts: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
                category: "Hollywood"
            },
            {
                title: "Deadpool & Wolverine",
                description: "Deadpool teams up with Wolverine in a multiverse-hopping adventure filled with action, humor, and chaos.",
                posterUrl: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/dvBCdCohwWbsP5qAaglOXagDMtk.jpg",
                duration: 127,
                language: "English",
                genres: ["Action", "Comedy", "Superhero"],
                releaseDate: new Date("2024-07-26"),
                ticketPrice: 380,
                rating: 8.5,
                casts: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"],
                category: "Hollywood"
            },
            {
                title: "Gladiator II",
                description: "The epic sequel to the legendary Gladiator. A new hero rises in the Roman arena to fight for honor and freedom.",
                posterUrl: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg",
                duration: 148,
                language: "English",
                genres: ["Action", "Drama", "History"],
                releaseDate: new Date("2024-11-22"),
                ticketPrice: 400,
                rating: 8.2,
                casts: ["Paul Mescal", "Denzel Washington", "Pedro Pascal"],
                category: "Hollywood"
            },
            {
                title: "Interstellar",
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
                duration: 169,
                language: "English",
                genres: ["Adventure", "Drama", "Sci-Fi"],
                releaseDate: new Date("2014-11-07"),
                ticketPrice: 350,
                rating: 8.9,
                casts: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
                category: "Hollywood"
            },
            {
                title: "The Dark Knight",
                description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
                duration: 152,
                language: "English",
                genres: ["Action", "Crime", "Drama"],
                releaseDate: new Date("2008-07-18"),
                ticketPrice: 300,
                rating: 9.0,
                casts: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
                category: "Hollywood"
            },
            {
                title: "Inception",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                posterUrl: "https://image.tmdb.org/t/p/w500/9gk7admal4zl248LOkx1GMz9hF7.jpg",
                backdropUrl: "https://image.tmdb.org/t/p/original/s3TBrRGB1jav7wJGNsODDbuzsOT.jpg",
                duration: 148,
                language: "English",
                genres: ["Action", "Adventure", "Sci-Fi"],
                releaseDate: new Date("2010-07-16"),
                ticketPrice: 320,
                rating: 8.8,
                casts: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
                category: "Hollywood"
            }
        ];

        // Clear existing data
        await Booking.deleteMany({});
        await Movie.deleteMany({});
        await Show.deleteMany({});
        console.log("🗑️ Cleared old data");

        // Add movies
        const createdMovies = await Movie.insertMany(sampleMovies);
        console.log(`✅ Added ${createdMovies.length} movies`);

        // Generate Theaters
        // Generate Theaters
        const cities = [
            { name: "New York", state: "New York" },
            { name: "Los Angeles", state: "California" },
            { name: "Chicago", state: "Illinois" },
            { name: "Houston", state: "Texas" },
            { name: "Phoenix", state: "Arizona" },
            { name: "Philadelphia", state: "Pennsylvania" },
            { name: "San Antonio", state: "Texas" },
            { name: "San Diego", state: "California" },
            { name: "Dallas", state: "Texas" },
            { name: "San Jose", state: "California" },
            { name: "Austin", state: "Texas" },
            { name: "Jacksonville", state: "Florida" },
            { name: "Fort Worth", state: "Texas" },
            { name: "Columbus", state: "Ohio" },
            { name: "San Francisco", state: "California" },
            { name: "Charlotte", state: "North Carolina" },
            { name: "Indianapolis", state: "Indiana" },
            { name: "Seattle", state: "Washington" },
            { name: "Denver", state: "Colorado" },
            { name: "Washington", state: "District of Columbia" },
            { name: "Boston", state: "Massachusetts" },
            { name: "El Paso", state: "Texas" },
            { name: "Nashville", state: "Tennessee" },
            { name: "Detroit", state: "Michigan" },
            { name: "Oklahoma City", state: "Oklahoma" },
            { name: "Portland", state: "Oregon" },
            { name: "Las Vegas", state: "Nevada" },
            { name: "Memphis", state: "Tennessee" },
            { name: "Louisville", state: "Kentucky" },
            { name: "Baltimore", state: "Maryland" },
            { name: "Milwaukee", state: "Wisconsin" },
            { name: "Albuquerque", state: "New Mexico" },
            { name: "Tucson", state: "Arizona" },
            { name: "Fresno", state: "California" },
            { name: "Mesa", state: "Arizona" },
            { name: "Sacramento", state: "California" },
            { name: "Atlanta", state: "Georgia" },
            { name: "Kansas City", state: "Missouri" },
            { name: "Colorado Springs", state: "Colorado" },
            { name: "Miami", state: "Florida" },
            { name: "Raleigh", state: "North Carolina" },
            { name: "Omaha", state: "Nebraska" },
            { name: "Long Beach", state: "California" },
            { name: "Virginia Beach", state: "Virginia" },
            { name: "Oakland", state: "California" },
            { name: "Minneapolis", state: "Minnesota" },
            { name: "Tulsa", state: "Oklahoma" },
            { name: "Tampa", state: "Florida" },
            { name: "Arlington", state: "Texas" },
            { name: "New Orleans", state: "Louisiana" }
        ];

        const theaterNames = ["AMC Theatres", "Regal Cinemas", "Cinemark", "Marcus Theatres", "Harkins Theatres", "Alamo Drafthouse", "B&B Theatres", "National Amusements", "Landmark Theatres", "Studio Movie Grill"];
        const theaterSuffixes = ["Multiplex", "16", "IMAX", "Cinema Suites", "Riverview", "Pavilion", "Promenade", "Town Center", "Metro", "Vista"];
        const theaterImages = [
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
            "https://images.unsplash.com/photo-1517604931442-710e8ed13b43?w=800&q=80",
            "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80",
            "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
            "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=800&q=80",
            "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=80",
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"
        ];

        await Theater.deleteMany({});
        console.log("🗑️ Cleared old theaters");

        const theaters = [];

        for (const city of cities) {
            // Create 8-12 theaters per city
            const numTheaters = Math.floor(Math.random() * 5) + 8;

            for (let i = 0; i < numTheaters; i++) {
                const brand = theaterNames[Math.floor(Math.random() * theaterNames.length)];
                const suffix = theaterSuffixes[Math.floor(Math.random() * theaterSuffixes.length)];

                theaters.push({
                    name: `${brand} ${suffix}`,
                    city: city.name,
                    state: city.state,
                    location: `${Math.floor(Math.random() * 100) + 1}, ${brand} Road, ${city.name}`,
                    image: theaterImages[Math.floor(Math.random() * theaterImages.length)],
                    facilities: ["Dolby Atmos", "4K Projection", "Recliner Seats", "Food Court", "IMAX"].slice(0, Math.floor(Math.random() * 4) + 1),
                    isActive: true
                });
            }
        }

        const createdTheaters = await Theater.insertMany(theaters);
        console.log(`✅ Added ${createdTheaters.length} theaters in ${cities.length} cities`);

        // Generate Shows
        const shows = [];
        const today = new Date();

        // For each theater, schedule shows for the next 7 days
        for (const theater of createdTheaters) {
            // Select random 5-8 movies for this theater
            const theaterMovies = createdMovies.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 5);

            for (const movie of theaterMovies) {
                // Schedule for next 7 days
                for (let d = 0; d < 7; d++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + d);
                    const dateStr = date.toISOString().split('T')[0];

                    // 4 shows per day
                    const timings = ["10:30", "14:00", "18:30", "21:45"];

                    for (const time of timings) {
                        shows.push({
                            movie: movie._id,
                            theater: theater._id,
                            showDateTime: new Date(`${dateStr}T${time}:00`),
                            priceStandard: movie.ticketPrice, // Use movie base price
                            pricePremium: movie.ticketPrice + 100,
                            priceVIP: movie.ticketPrice + 200,
                            occupiedSeats: [] // Start empty
                        });
                    }
                }
            }
        }

        await Show.insertMany(shows);
        console.log(`✅ Added ${shows.length} shows`);

        console.log("🎉 Database seeded successfully with Premium Data!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
