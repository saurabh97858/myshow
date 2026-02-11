import express from 'express';
import { createExperience, getAllExperiences } from '../controllers/experienceController.js';

const experienceRouter = express.Router();

experienceRouter.post('/create', createExperience);
experienceRouter.get('/all', getAllExperiences);

export default experienceRouter;
