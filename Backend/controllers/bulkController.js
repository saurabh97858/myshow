import Booking from '../models/bookingModel.js';
import Movie from '../models/Movie.js';
import Show from '../models/showModel.js';
import Theater from '../models/Theater.js';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

// Bulk upload movies from CSV
export const bulkUploadMovies = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const results = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', async () => {
                let successCount = 0;
                let failCount = 0;

                for (const row of results) {
                    try {
                        await Movie.create({
                            title: row.title,
                            description: row.description,
                            duration: parseInt(row.duration),
                            releaseDate: new Date(row.releaseDate),
                            language: row.language,
                            genres: row.genres ? row.genres.split('|') : [],
                            casts: row.casts ? row.casts.split('|') : [],
                            posterUrl: row.posterUrl,
                            backdropUrl: row.backdropUrl,
                            rating: parseFloat(row.rating) || 0
                        });
                        successCount++;
                    } catch (error) {
                        failCount++;
                        errors.push({
                            row: row.title,
                            error: error.message
                        });
                    }
                }

                // Clean up uploaded file
                fs.unlinkSync(req.file.path);

                res.json({
                    success: true,
                    message: `Uploaded ${successCount} movies, ${failCount} failed`,
                    successCount,
                    failCount,
                    errors
                });
            });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bulk create shows
export const bulkCreateShows = async (req, res) => {
    try {
        const { shows } = req.body; // Array of show objects

        if (!Array.isArray(shows) || shows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Shows array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const show of shows) {
            try {
                const newShow = await Show.create({
                    movie: show.movieId,
                    theater: show.theaterId,
                    date: show.date,
                    time: show.time,
                    priceStandard: show.priceStandard || 100,
                    pricePremium: show.pricePremium || 150,
                    priceVIP: show.priceVIP || 250,
                    occupiedSeats: {}
                });
                results.push(newShow);
            } catch (error) {
                errors.push({
                    show: `${show.movieId}-${show.date}-${show.time}`,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Created ${results.length} shows, ${errors.length} failed`,
            successCount: results.length,
            failCount: errors.length,
            errors
        });
    } catch (error) {
        console.error('Bulk create shows error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bulk update prices
export const bulkUpdatePrices = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { showId, prices }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        let successCount = 0;
        const errors = [];

        for (const update of updates) {
            try {
                await Show.findByIdAndUpdate(update.showId, {
                    priceStandard: update.priceStandard,
                    pricePremium: update.pricePremium,
                    priceVIP: update.priceVIP
                });
                successCount++;
            } catch (error) {
                errors.push({
                    showId: update.showId,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Updated ${successCount} shows`,
            successCount,
            failCount: errors.length,
            errors
        });
    } catch (error) {
        console.error('Bulk update prices error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete old shows
export const deleteOldShows = async (req, res) => {
    try {
        const { daysBefore = 30 } = req.body;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBefore);

        const result = await Show.deleteMany({
            date: { $lt: cutoffDate.toISOString().split('T')[0] }
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} old shows`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Delete old shows error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
