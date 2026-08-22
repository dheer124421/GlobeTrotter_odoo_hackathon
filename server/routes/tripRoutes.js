import express from 'express';
import { createTrip, getTrips, deleteTrip, getTripById, updateItinerary, getTripByIdPublic, copyTrip } from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route to view a shared trip
router.get('/:id/public', getTripByIdPublic);

// Apply protect middleware to subsequet authenticated routes
router.use(protect);

router.post('/', createTrip);
router.get('/', getTrips);
router.post('/:id/copy', copyTrip);
router.get('/:id', getTripById);
router.put('/:id/itinerary', updateItinerary);
router.delete('/:id', deleteTrip);

export default router;
