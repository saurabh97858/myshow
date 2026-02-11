import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: String, // e.g., "Excellent", "Good", "Average", "Poor"
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;
