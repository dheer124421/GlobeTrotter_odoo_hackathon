import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Compass,
    Calendar,
    MapPin,
    ArrowLeft,
    User,
    LogOut,
    Plus,
    Check,
    Loader
} from 'lucide-react';
import './CreateTrip.css';

// Predefined suggestion data for tourist hot spots
const PLACES_SUGGESTIONS = {
    Paris: [
        { id: 'p1', name: 'Eiffel Tower', category: 'Sightseeing', desc: 'Ascend Paris landmark for panoramic aerial views.', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
        { id: 'p2', name: 'Louvre Museum', category: 'Art & Culture', desc: 'Secure tickets for the Mona Lisa and historic masterpieces.', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80' },
        { id: 'p3', name: 'Seine River Cruise', category: 'Adventure', desc: 'Glide past cathedrals and lighted bridges on a standard boat tour.', img: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=400&q=80' },
        { id: 'p4', name: 'Montmartre Neighborhood', category: 'Walking Tour', desc: 'Explore cobblestone alleys and artwork around Sacré-Cœur.', img: 'https://images.unsplash.com/photo-1509060464153-4466739f78d6?auto=format&fit=crop&w=400&q=80' },
        { id: 'p5', name: 'Palace of Versailles', category: 'History', desc: 'Take a brief train ride to view the grand Hall of Mirrors.', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80' },
        { id: 'p6', name: 'French Bistro Tasting', category: 'Food & Dining', desc: 'Sample local culinary icons: escargots, cheese, steak frites.', img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80' }
    ],
    Tokyo: [
        { id: 't1', name: 'Shibuya Crossing', category: 'Sightseeing', desc: 'Witness the iconic scramble intersection and neon lights.', img: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=400&q=80' },
        { id: 't2', name: 'Senso-ji Temple', category: 'Culture', desc: 'Tokyo’s oldest Buddhist Temple located in Asakusa.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80' },
        { id: 't3', name: 'Toyosu Fish Market', category: 'Food & Dining', desc: 'Arrive early for world-class sushi auctions and tasting.', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80' },
        { id: 't4', name: 'Akihabara Electric Town', category: 'Shopping', desc: 'Explore multilevel anime, gaming, and vintage electronics stores.', img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80' },
        { id: 't5', name: 'Shinjuku Gyoen Garden', category: 'Nature', desc: 'Recharge amongst classical Japanese tea ceremony houses.', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80' },
        { id: 't6', name: 'Meiji Jingu Shrine', category: 'History', desc: 'Walk under Torii gates through a tranquil forest buffer.', img: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80' }
    ],
    NewYork: [
        { id: 'n1', name: 'Central Park Walk', category: 'Nature', desc: 'Rent a rowboat or bridge stroll to Bethesda Fountain.', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
        { id: 'n2', name: 'Empire State Building', category: 'Sightseeing', desc: 'Ride elevators to the 86th floor peak observatory deck.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80' },
        { id: 'n3', name: 'Metropolitan Museum of Art', category: 'Art & Culture', desc: 'Browse the Egyptian Temple of Dendur and classic galleries.', img: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=400&q=80' },
        { id: 'n4', name: 'Times Square Lights', category: 'Sightseeing', desc: 'Behold high-definition digital billboards and ticket centers.', img: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=400&q=80' },
        { id: 'n5', name: 'High Line Park Elevated Walk', category: 'Nature', desc: 'Stroll on raw freight rail tracks repurposed into gardens.', img: 'https://images.unsplash.com/photo-1522083165195-342750297f91?auto=format&fit=crop&w=400&q=80' },
        { id: 'n6', name: 'Broadway Theater Show', category: 'Entertainment', desc: 'Buy day-of tickets for renowned musicals in central Manhattan.', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80' }
    ],
    Rome: [
        { id: 'r1', name: 'Roman Colosseum', category: 'History', desc: 'Access ancient gladiator tunnels and arena deck ruins.', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
        { id: 'r2', name: 'Trevi Fountain Coins', category: 'Sightseeing', desc: 'Join the custom of tossing coins over your shoulder.', img: 'https://images.unsplash.com/photo-1525874684015-58379d42152e?auto=format&fit=crop&w=400&q=80' },
        { id: 'r3', name: 'Vatican Sistine Chapel', category: 'Art & Culture', desc: 'Marvel at Michelangelo frescoes inside iconic museums.', img: 'https://images.unsplash.com/photo-1541088998638-3486337839ec?auto=format&fit=crop&w=400&q=80' },
        { id: 'r4', name: 'Roman Pantheon', category: 'History', desc: 'Behold the incredible dome and central open oculus skylight.', img: 'https://images.unsplash.com/photo-1531572753726-0ff349f575b2?auto=format&fit=crop&w=400&q=80' },
        { id: 'r5', name: 'Trastevere Cuisine Walk', category: 'Food & Dining', desc: 'Sample authentic Roman pastas: carbonara, cacio e pepe.', img: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&w=400&q=80' },
        { id: 'r6', name: 'Roman Forum', category: 'History', desc: 'Trace cobblestone archways of ancient temples.', img: 'https://images.unsplash.com/photo-1529260830199-4455b9028712?auto=format&fit=crop&w=400&q=80' }
    ],
    Default: [
        { id: 'd1', name: 'Taj Mahal (Agra)', category: 'Sightseeing', desc: 'Visit the world-famous white marble mausoleum.', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80' },
        { id: 'd2', name: 'Machu Picchu (Peru)', category: 'Adventure', desc: 'Hike the Inca trail to view high-altitude fortress ruins.', img: 'https://images.unsplash.com/photo-1507619572574-63a258a98442?auto=format&fit=crop&w=400&q=80' },
        { id: 'd3', name: 'Kyoto Temples (Japan)', category: 'Culture', desc: 'Stroll among gold pavilions and bamboo forests.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80' },
        { id: 'd4', name: 'Venice Canals (Italy)', category: 'Sightseeing', desc: 'Board a traditional gondola through historical waterways.', img: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=400&q=80' },
        { id: 'd5', name: 'Grand Canyon Hike (USA)', category: 'Nature', desc: 'Gaze out across massive red sandstone gorges.', img: 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=400&q=80' },
        { id: 'd6', name: 'Serengeti Safari (Tanzania)', category: 'Wildlife', desc: 'Track migratory cheetahs and lions across savannah plains.', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80' }
    ]
};

const CreateTrip = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Form parameters
    const [tripName, setTripName] = useState('');
    const [selectedPlace, setSelectedPlace] = useState('Paris'); // default selector category
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');

    // Recommendation selections
    const [activeSuggestions, setActiveSuggestions] = useState(PLACES_SUGGESTIONS.Paris);
    const [selectedSuggestions, setSelectedSuggestions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Dropdown states
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Update suggestion grid when destination changes
    useEffect(() => {
        const key = selectedPlace.replace(/\s+/g, '');
        if (PLACES_SUGGESTIONS[key]) {
            setActiveSuggestions(PLACES_SUGGESTIONS[key]);
        } else {
            setActiveSuggestions(PLACES_SUGGESTIONS.Default);
        }
        // Clear selections when switching place categories
        setSelectedSuggestions([]);
    }, [selectedPlace]);

    const handleSuggestionClick = (activity) => {
        if (selectedSuggestions.some(item => item.id === activity.id)) {
            // Remove it
            setSelectedSuggestions(prev => prev.filter(item => item.id !== activity.id));
        } else {
            // Add it
            setSelectedSuggestions(prev => [...prev, activity]);
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tripName || !selectedPlace || !startDate || !endDate) {
            setError('Please fill in all required form parameters.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            setError('End Date cannot be earlier than your Start Date.');
            return;
        }

        setError('');
        setSubmitting(true);

        // Dynamic region determination
        let region = 'None';
        if (selectedPlace === 'Paris' || selectedPlace === 'Rome') region = 'Europe';
        else if (selectedPlace === 'Tokyo') region = 'Asia';
        else if (selectedPlace === 'New York') region = 'Americas';

        // Compile activities into descripton tags
        const activityNames = selectedSuggestions.map(item => item.name).join(', ');
        const finalDescription = description
            ? `${description}. Planned activities: ${activityNames}`
            : `My getaway to ${selectedPlace}. Highlights: ${activityNames || 'Exploring the city'}`;

        // Select cover photo based on location selected
        let coverPhoto = '';
        const activeData = PLACES_SUGGESTIONS[selectedPlace.replace(/\s+/g, '')] || PLACES_SUGGESTIONS.Default;
        if (activeData && activeData.length > 0) {
            coverPhoto = activeData[0].img; // Use first suggestion image as main cover
        }

        try {
            await api.post('/trips', {
                name: tripName,
                startDate,
                endDate,
                description: finalDescription,
                region,
                coverPhoto,
                destinationCount: selectedSuggestions.length,
                totalBudget: selectedSuggestions.length * 300 + 1000 // Mock budget increments
            });

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Server error saving trip.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-trip-page">
            {/* Header section */}
            <header className="create-trip-header">
                <div className="header-container">
                    <div className="dashboard-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <Compass className="logo-icon" size={28} />
                        <span>GlobalTrotter</span>
                    </div>

                    <div className="profile-container">
                        <button
                            className="profile-btn"
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        >
                            {user && user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="User Profile" />
                            ) : (
                                <div className="profile-btn-placeholder">
                                    <User size={18} />
                                </div>
                            )}
                        </button>

                        {profileDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-user-details">
                                    <p className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'Traveler'}</p>
                                    <p className="user-email">{user ? user.email : ''}</p>
                                </div>
                                <hr className="dropdown-divider" />
                                <Link to="/dashboard" className="dropdown-item" style={{ textDecoration: 'none' }}>
                                    <Compass size={16} style={{ marginRight: '8px' }} />
                                    Dashboard
                                </Link>
                                <Link to="/trips" className="dropdown-item" style={{ textDecoration: 'none' }}>
                                    <Compass size={16} style={{ marginRight: '8px' }} />
                                    My Trips (List View)
                                </Link>
                                <button className="dropdown-item logout-btn" onClick={handleLogoutClick}>
                                    <LogOut size={16} style={{ marginRight: '8px' }} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content wrapper */}
            <main className="create-trip-main">

                {/* Back Link and Page header */}
                <div className="header-row">
                    <button onClick={() => navigate('/dashboard')} className="back-link-btn">
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <h2>Plan a new trip</h2>
                </div>

                {error && <div className="create-trip-error">{error}</div>}

                <div className="trip-plan-grid">

                    {/* Left Column: Form Details */}
                    <section className="trip-form-section">
                        <form onSubmit={handleSubmit} className="trip-creation-form">

                            <div className="form-group-block">
                                <label className="req-label">Trip Name:</label>
                                <div className="form-input-container">
                                    <input
                                        type="text"
                                        placeholder="e.g. Summer Vacation in France"
                                        value={tripName}
                                        onChange={(e) => setTripName(e.target.value)}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-block">
                                <label className="req-label">Select a Place:</label>
                                <div className="form-input-container">
                                    <select
                                        value={selectedPlace}
                                        onChange={(e) => setSelectedPlace(e.target.value)}
                                        disabled={submitting}
                                    >
                                        <option value="Paris">Paris (France)</option>
                                        <option value="Tokyo">Tokyo (Japan)</option>
                                        <option value="New York">New York (USA)</option>
                                        <option value="Rome">Rome (Italy)</option>
                                        <option value="Default">Other (Global locations)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group-block">
                                <label className="req-label">Start Date:</label>
                                <div className="form-input-container">
                                    <Calendar className="date-icon" size={16} />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-block">
                                <label className="req-label">End Date:</label>
                                <div className="form-input-container">
                                    <Calendar className="date-icon" size={16} />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-block textarea-block">
                                <label>Trip Description / Notes:</label>
                                <div className="form-input-container">
                                    <textarea
                                        placeholder="Type details about this trip..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={submitting}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="plan-submit-btn" disabled={submitting}>
                                {submitting ? (
                                    <Loader className="spinner" size={20} />
                                ) : (
                                    <>
                                        <Plus size={16} style={{ marginRight: '6px' }} />
                                        Save Journey Plan
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    {/* Right Column: Interactive Search Suggestions Grid */}
                    <section className="trip-suggestions-section">
                        <h3 className="section-title">
                            Suggestion for Places to Visit/Activities to perform in {selectedPlace}
                        </h3>

                        <div className="suggestions-cards-grid">
                            {activeSuggestions.map((activity) => {
                                const isSelected = selectedSuggestions.some(item => item.id === activity.id);
                                return (
                                    <div
                                        key={activity.id}
                                        className={`suggestion-item-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSuggestionClick(activity)}
                                    >
                                        <div className="img-holder">
                                            <img src={activity.img} alt={activity.name} />
                                            <span className="card-badge">{activity.category}</span>
                                            {isSelected && (
                                                <div className="selected-indicator-overlay">
                                                    <Check size={24} className="check-mark" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-details">
                                            <h4>{activity.name}</h4>
                                            <p>{activity.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default CreateTrip;
