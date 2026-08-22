import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, User, Mail, Phone, MapPin, Globe, FileText, Loader } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        additionalInfo: '',
        password: '',
        confirmPassword: ''
    });
    const [profilePhoto, setProfilePhoto] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image file must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, password, confirmPassword } = formData;

        if (!firstName || !lastName || !email || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setError('');
        setSubmitting(true);

        const signupData = {
            ...formData,
            profilePhoto
        };
        delete signupData.confirmPassword; // Don't submit confirmation key to backend

        const result = await signup(signupData);
        setSubmitting(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper register-wrapper">
                <div className="auth-card register-card">
                    <form onSubmit={handleSubmit} className="auth-form">

                        {/* Avatar Photo Section */}
                        <div className="avatar-upload-section">
                            <div className="avatar-circle-wrapper">
                                <div className="avatar-circle">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile Preview" className="avatar-preview-img" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <User size={48} className="default-icon" />
                                        </div>
                                    )}
                                    <label htmlFor="avatar-input" className="avatar-badge">
                                        <Camera size={16} />
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    id="avatar-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <span className="avatar-label">Profile Photo</span>
                            </div>
                        </div>

                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">Join the Globe Trotter travel community</p>

                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="required-field">First Name</label>
                                <div className="input-icon-wrapper">
                                    <User className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="required-field">Last Name</label>
                                <div className="input-icon-wrapper">
                                    <User className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="required-field">Email Address</label>
                                <div className="input-icon-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <div className="input-icon-wrapper">
                                    <Phone className="input-icon" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+1 (555) 0192"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>City</label>
                                <div className="input-icon-wrapper">
                                    <MapPin className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="Paris"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Country</label>
                                <div className="input-icon-wrapper">
                                    <Globe className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="country"
                                        placeholder="France"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Additional Information</label>
                                <div className="input-icon-wrapper textarea-wrapper">
                                    <FileText className="input-icon textarea-icon" size={18} />
                                    <textarea
                                        name="additionalInfo"
                                        placeholder="Tell us about your favorite travel destinations or style..."
                                        value={formData.additionalInfo}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="required-field">Password</label>
                                <div className="input-icon-wrapper">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="required-field">Confirm Password</label>
                                <div className="input-icon-wrapper">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={submitting}>
                            {submitting ? <Loader className="spinner" size={20} /> : 'Register Users'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
