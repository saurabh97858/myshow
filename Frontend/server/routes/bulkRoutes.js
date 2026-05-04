import express from 'express';
import { requireAuth } from '@clerk/express';
import { isAdmin } from '../middleware/isAdmin.js';
import multer from 'multer';
import {
    bulkUploadMovies,
    bulkCreateShows,
    bulkUpdatePrices,
    deleteOldShows
} from '../controllers/bulkController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/bulk/' });

// All bulk routes require admin authentication
router.use(requireAuth(), isAdmin);

router.post('/movies/upload', upload.single('csvFile'), bulkUploadMovies);
router.post('/shows/create', bulkCreateShows);
router.post('/prices/update', bulkUpdatePrices);
router.delete('/shows/old', deleteOldShows);

export default router;
