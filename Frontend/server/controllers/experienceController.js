import Experience from '../models/experienceModel.js';

// Create a new experience
export const createExperience = async (req, res) => {
    try {
        const { name, rating, comment } = req.body;

        const newExperience = new Experience({
            name,
            rating,
            comment
        });

        await newExperience.save();

        res.status(201).json({
            success: true,
            message: 'Experience shared successfully',
            experience: newExperience
        });
    } catch (error) {
        console.error('Error sharing experience:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share experience',
            error: error.message
        });
    }
};

// Get all experiences
export const getAllExperiences = async (req, res) => {
    try {
        const experiences = await Experience.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            experiences
        });
    } catch (error) {
        console.error('Error fetching experiences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch experiences',
            error: error.message
        });
    }
};
