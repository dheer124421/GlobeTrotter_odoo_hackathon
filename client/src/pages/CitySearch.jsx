import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Compass,
    User,
    LogOut,
    ArrowLeft,
    Search,
    MapPin,
    DollarSign,
    Star,
    Plus,
    Check,
    Loader,
    Sliders,
    ChevronDown
} from 'lucide-react';
import './CitySearch.css';

const CitySearch = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [trip, setTrip] = useState(null);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [addingCityId, setAddingCityId] = useState(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('All');
    const [costIndex, setCostIndex] = useState('All');
    const [sort, setSort] = useState('name'); // name, ratingDesc, costAsc, costDesc

    const regions = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

    const fetchTripDetails = async () => {
        try {
            const response = await api.get(`/trips/${tripId}`);
            setTrip(response.data.data);
        } catch (err) {
            console.error(err);
            setError('Could not retrieve parent trip details.');
        }
    };

    const fetchCities = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (region !== 'All') params.region = region;
            if (costIndex !== 'All') params.costIndex = costIndex;
            params.sort = sort;

            const response = await api.get('/cities', { params });
            setCities(response.data.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch cities.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTripDetails();
    }, [tripId]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchCities();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search, region, costIndex, sort]);

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const handleAddCityToTrip = async (city) => {
        if (!trip) return;
        setAddingCityId(city._id);
        setError('');
        setSuccessMsg('');

        try {
            // Create new itinerary section data model
            const newSection = {
                title: `${city.name}, ${city.country}`,
                description: `Explore stops and details in ${city.name}.`,
                startDate: trip.startDate ? trip.startDate.substring(0, 10) : '',
                endDate: trip.endDate ? trip.endDate.substring(0, 10) : '',
                budget: 0,
                activities: []
            };

            const currentSections = trip.itinerarySections || [];
            const updatedSections = [...currentSections, newSection];

            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });

            setTrip(response.data.data);
            setSuccessMsg(`Successfully added ${city.name} to ${trip.name}!`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to add city stage to itinerary.');
        } finally {
            setAddingCityId(null);
        }
    };

    // Render cost indicator ($$$)
    const renderCostSymbol = (costIndexVal) => {
        const symbols = [];
        for (let i = 0; i < 5; i++) {
            symbols.push(
                <DollarSign
                    key={i}
                    size={14}
                    className={i < costIndexVal ? 'cost-active' : 'cost-inactive'}
                />
            );
        }
        return <span className="cost-symbol-row">{symbols}</span>;
    };

    return (
        <div className="city-search-page">
            {/* Header section */}
            <header className="city-search-header">
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

            {/* Main planner panels */}
            <main className="city-search-main">
                <div className="header-navigation-row">
                    <div className="nav-buttons-block">
                        <button onClick={() => navigate(`/trips/${tripId}/itinerary`)} className="back-link-btn">
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        {trip && (
                            <span className="current-trip-indicator">
                                Planning: <strong>{trip.name}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {error && <div className="feedback-bar error-bar">{error}</div>}
                {successMsg && <div className="feedback-bar success-bar">{successMsg}</div>}

                {/* Aligned Controls Bar resembling Screen 8 query UI */}
                <section className="controls-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search cities, countries..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filters-container">
                        <div className="select-wrapper">
                            <label>Region</label>
                            <select value={region} onChange={(e) => setRegion(e.target.value)}>
                                <option value="All">All Regions</option>
                                {regions.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Cost</label>
                            <select value={costIndex} onChange={(e) => setCostIndex(e.target.value)}>
                                <option value="All">All Budgets</option>
                                <option value="1">$ (Budget)</option>
                                <option value="2">$$ (Economy)</option>
                                <option value="3">$$$ (Moderate)</option>
                                <option value="4">$$$$ (Premium)</option>
                                <option value="5">$$$$$ (Luxury)</option>
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Sort by...</label>
                            <select value={sort} onChange={(e) => setSort(e.target.value)}>
                                <option value="name">Name (A-Z)</option>
                                <option value="ratingDesc">Popularity (High)</option>
                                <option value="costAsc">Rate (Low to High)</option>
                                <option value="costDesc">Rate (High to Low)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Results layout mapping option details cards */}
                <section className="cities-results-section">
                    <h3>Results</h3>

                    {loading ? (
                        <div className="loading-wrapper">
                            <Loader className="spinner" size={32} />
                            <p>Exploring global places...</p>
                        </div>
                    ) : cities.length === 0 ? (
                        <div className="empty-cities-state">
                            <Compass size={40} className="empty-icon" />
                            <p>No cities found matching your filter criteria.</p>
                        </div>
                    ) : (
                        <div className="cities-results-list">
                            {cities.map((city) => (
                                <div key={city._id} className="city-result-card">
                                    {/* Left Column: Image banner */}
                                    <div className="city-photo-banner">
                                        <img src={city.coverPhoto} alt={city.name} />
                                    </div>

                                    {/* Middle Column: details options */}
                                    <div className="city-details-main">
                                        <div className="city-head-row">
                                            <div className="city-title-group">
                                                <h4>{city.name}</h4>
                                                <span className="country-lbl">
                                                    <MapPin size={12} style={{ marginRight: '3px' }} />
                                                    {city.country} ({city.region})
                                                </span>
                                            </div>

                                            <div className="ratings-cost-group">
                                                <div className="rating-badge">
                                                    <Star size={12} className="star-icon" />
                                                    <span>{city.popularity.toFixed(1)}</span>
                                                </div>
                                                {renderCostSymbol(city.costIndex)}
                                            </div>
                                        </div>

                                        <p className="city-description">{city.description}</p>
                                    </div>

                                    {/* Right Column: Actions */}
                                    <div className="city-actions-column">
                                        <button
                                            className={`add-city-trip-btn ${addingCityId === city._id ? 'adding' : ''}`}
                                            onClick={() => handleAddCityToTrip(city)}
                                            disabled={addingCityId !== null}
                                        >
                                            {addingCityId === city._id ? (
                                                <Loader className="spinner" size={16} />
                                            ) : (
                                                <>
                                                    <Plus size={16} />
                                                    <span>Add to Trip</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default CitySearch;
