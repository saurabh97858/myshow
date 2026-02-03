import express from 'express';
import { getLocations, getTheatersByCity, getShowsByCity, getShowsByTheater } from '../controllers/theaterController.js';

const theaterRouter = express.Router();

theaterRouter.get('/locations', getLocations);
theaterRouter.get('/city/:city', getTheatersByCity);
theaterRouter.get('/shows/:city', getShowsByCity);
theaterRouter.get('/details/:theaterId', getShowsByTheater);

export default theaterRouter;
