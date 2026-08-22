import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforglobetrotterappdev2026');

            // Get user from token and attach to request
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ status: 'error', message: 'User not found, authorization failed' });
            }

            return next();
        } catch (error) {
            console.error('Session authentication error:', error.message);
            return res.status(401).json({ status: 'error', message: 'Not authorized, token verification failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, token missing' });
    }
};
