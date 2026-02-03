import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        posterUrl: { type: String, required: true },
        backdropUrl: { type: String, default: "" },
        duration: { type: Number, required: true }, // Runtime in minutes
        language: { type: String, default: "Hindi" },
        genres: { type: [String], default: [] },
        releaseDate: { type: Date, required: true },
        ticketPrice: { type: Number, required: true }, // Price in rupees
        rating: { type: Number, default: 0, min: 0, max: 10 },
        casts: { type: [String], default: [] }, // Array of cast names
        category: { type: String, enum: ['Indian', 'Hollywood'], default: 'Indian' }, // Movie category
    },
    { timestamps: true }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
