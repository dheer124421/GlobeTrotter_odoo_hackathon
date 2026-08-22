import express from 'express';
import { createTrip, getTrips, deleteTrip } from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.post('/', createTrip);
router.get('/', getTrips);
router.delete('/:id', deleteTrip);

export default router;
