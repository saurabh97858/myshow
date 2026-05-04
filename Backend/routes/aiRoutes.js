import express from 'express';
import { chatWithAI, generateMovieDetails } from '../controllers/aiController.js';
import { protectAdmin } from '../middleware/auth.js'; 

const router = express.Router();

router.get('/ping', (req, res) => res.json({ success: true, message: "AI API is reachable" }));
router.post('/chat', chatWithAI);
router.post('/generate-movie', protectAdmin, generateMovieDetails);

export default router;
