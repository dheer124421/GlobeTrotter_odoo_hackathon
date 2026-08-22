import express from 'express';
import { getCities } from '../controllers/cityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getCities);

export default router;
