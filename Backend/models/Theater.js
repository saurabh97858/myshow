import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        city: { type: String, required: true, index: true },
        state: { type: String, required: true },
        location: { type: String, required: true }, // Full address
        image: { type: String, required: true }, // URL to theater image
        facilities: { type: [String], default: [] }, // e.g., ["Dolby Atmos", "Recliner", "Food Court"]
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Theater = mongoose.model("Theater", theaterSchema);
export default Theater;
