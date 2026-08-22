import Trip from '../models/Trip.js';

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
    const { name, startDate, endDate, description, coverPhoto, region, totalBudget } = req.body;

    try {
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ status: 'error', message: 'Please provide a name, start date, and end date' });
        }

        const trip = await Trip.create({
            user: req.user._id,
            name,
            startDate,
            endDate,
            description,
            coverPhoto,
            region: region || 'None',
            totalBudget: totalBudget || 0
        });

        res.status(201).json({
            status: 'success',
            data: trip
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Get user trips with search, sort, filter, and grouping support
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
    const { search, region, filter, sort, groupBy } = req.query;

    try {
        // 1. Build Query
        const query = { user: req.user._id };

        // Search query matching name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by Region
        if (region && region !== 'All' && region !== 'None') {
            query.region = region;
        }

        // Filter by Time (upcoming, past, active)
        const today = new Date();
        if (filter === 'upcoming') {
            query.startDate = { $gt: today };
        } else if (filter === 'past') {
            query.endDate = { $lt: today };
        } else if (filter === 'active') {
            query.startDate = { $lte: today };
            query.endDate = { $gte: today };
        }

        // 2. Query Database with sorting
        let sortOptions = {};
        if (sort === 'dateAsc') {
            sortOptions = { startDate: 1 };
        } else if (sort === 'dateDesc') {
            sortOptions = { startDate: -1 };
        } else if (sort === 'nameAsc') {
            sortOptions = { name: 1 };
        } else if (sort === 'nameDesc') {
            sortOptions = { name: -1 };
        } else {
            // Default: sort by start date descending (newest first)
            sortOptions = { startDate: -1 };
        }

        const trips = await Trip.find(query).sort(sortOptions);

        // 3. Handle Grouping
        if (groupBy === 'year') {
            const grouped = {};
            trips.forEach((trip) => {
                const year = new Date(trip.startDate).getFullYear();
                if (!grouped[year]) grouped[year] = [];
                grouped[year].push(trip);
            });
            return res.status(200).json({ status: 'success', grouped: true, groupBy: 'year', data: grouped });
        }

        if (groupBy === 'month') {
            const grouped = {};
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            trips.forEach((trip) => {
                const date = new Date(trip.startDate);
                const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(trip);
            });
            return res.status(200).json({ status: 'success', grouped: true, groupBy: 'month', data: grouped });
        }

        // Standard list response
        res.status(200).json({
            status: 'success',
            grouped: false,
            data: trips
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
    const { id } = req.params;

    try {
        const trip = await Trip.findOneAndDelete({ _id: id, user: req.user._id });
        if (!trip) {
            return res.status(404).json({ status: 'error', message: 'Trip not found or unauthorized' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
