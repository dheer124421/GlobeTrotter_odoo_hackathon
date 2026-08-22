import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

// Helper to sign JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforglobetrotterappdev2026', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    const { firstName, lastName, email, password, phone, city, country, additionalInfo, profilePhoto } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ status: 'error', message: 'User with this email already exists' });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            city,
            country,
            additionalInfo,
            profilePhoto,
        });

        if (user) {
            res.status(201).json({
                status: 'success',
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                    country: user.country,
                    additionalInfo: user.additionalInfo,
                    profilePhoto: user.profilePhoto,
                },
            });
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email (or username, in this MERN project login forms accept email as primary key)
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                status: 'success',
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                    country: user.country,
                    additionalInfo: user.additionalInfo,
                    profilePhoto: user.profilePhoto,
                },
            });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.status(200).json({
                status: 'success',
                user,
            });
        } else {
            res.status(404).json({ status: 'error', message: 'User profile not found' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Update user profile settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const { firstName, lastName, email, phone, city, country, language, profilePhoto } = req.body;

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.city = city || user.city;
        user.country = country || user.country;
        user.language = language || user.language;
        if (profilePhoto !== undefined) {
            user.profilePhoto = profilePhoto;
        }

        await user.save();

        res.status(200).json({
            status: 'success',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                city: user.city,
                country: user.country,
                language: user.language,
                profilePhoto: user.profilePhoto,
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Delete user account and all trips
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Cascade delete all trips belonging to this user
        await Trip.deleteMany({ user: userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            status: 'success',
            message: 'User account and all trips deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
