import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";
import Show from "./models/showModel.js";

dotenv.config();

const addSampleShows = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to DB");

        // Find all movies
        const movies = await Movie.find({});
        console.log(`Found ${movies.length} movies`);

        if (movies.length === 0) {
            console.log("❌ No movies found. Please add movies first.");
            process.exit(1);
        }

        // Generate dates for next 7 days
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }

        // Show times
        const times = ["10:30", "14:00", "17:30", "21:00"];

        let showsCreated = 0;

        for (const movie of movies) {
            console.log(`\nAdding shows for: ${movie.title}`);

            // Check if movie already has shows
            const existingShows = await Show.find({ movie: movie._id });
            if (existingShows.length > 0) {
                console.log(`  - Already has ${existingShows.length} shows, skipping...`);
                continue;
            }

            // Create shows for each date and time
            for (const date of dates) {
                for (const time of times) {
                    const showDateTime = new Date(`${date}T${time}:00`);

                    // Skip if show time is in the past
                    if (showDateTime < new Date()) continue;

                    await Show.create({
                        movie: movie._id,
                        showDateTime,
                        priceStandard: 100,
                        pricePremium: 150,
                        priceVIP: 250,
                        occupiedSeats: {},
                    });
                    showsCreated++;
                }
            }
            console.log(`  ✅ Added shows for ${movie.title}`);
        }

        console.log(`\n🎉 Created ${showsCreated} new shows!`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

addSampleShows();
