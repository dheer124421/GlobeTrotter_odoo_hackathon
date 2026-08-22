import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Lock, Loader } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setSubmitting(true);
        const result = await login(email, password);
        setSubmitting(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="avatar-container">
                        <div className="avatar-circle">
                            <Compass className="default-icon" size={48} />
                        </div>
                    </div>
                    <h2 className="auth-title">Globe Trotter</h2>
                    <p className="auth-subtitle">Login to your account</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-icon-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-icon-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={submitting}>
                            {submitting ? <Loader className="spinner" size={20} /> : 'Login'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
