import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import { getLocations, getTheatersByCity, getShowsByCity, getShowsByTheater, addTheater, getMyTheaters } from '../controllers/theaterController.js';

const theaterRouter = express.Router();

theaterRouter.get('/locations', getLocations);
theaterRouter.get('/city/:city', getTheatersByCity);
theaterRouter.get('/shows/:city', getShowsByCity);
theaterRouter.get('/details/:theaterId', getShowsByTheater);
theaterRouter.post('/add', protectAdmin, addTheater);
theaterRouter.get('/my-theaters', protectAdmin, getMyTheaters);

export default theaterRouter;
