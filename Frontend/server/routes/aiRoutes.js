import express from 'express';
import { chatWithAI, generateMovieDetails } from '../controllers/aiController.js';
import { protectAdmin } from '../middleware/auth.js'; 

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/generate-movie', protectAdmin, generateMovieDetails);

export default router;
