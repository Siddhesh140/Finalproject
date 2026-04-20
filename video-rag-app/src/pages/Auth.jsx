import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

// Input field component with icon
const AuthInput = ({ icon, type, placeholder, value, onChange, name }) => (
    <div className="auth-input-wrapper">
        <span className="material-symbols-outlined auth-input-icon">{icon}</span>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="auth-input"
            autoComplete={type === 'password' ? 'current-password' : 'off'}
        />
    </div>
);

AuthInput.propTypes = {
    icon: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
};

// Login Form Component
const LoginForm = ({ onForgotPassword, onSwitchToSignup, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password,
            });
            
            authAPI.setToken(response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            onLoginSuccess(response.user);
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="auth-form"
        >
            <h2 className="auth-title">Welcome Back 👋</h2>
            <p className="auth-subtitle">Sign in to continue your learning adventure</p>

            <AuthInput
                icon="mail"
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
            />

            <AuthInput
                icon="lock"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />

            <button
                type="button"
                onClick={onForgotPassword}
                className="auth-forgot-link"
            >
                Forgot Password?
            </button>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-button" disabled={loading}>
                <span className="material-symbols-outlined">{loading ? 'hourglass_empty' : 'rocket_launch'}</span>
                {loading ? 'Launching...' : 'Launch In! 🚀'}
            </button>

            <p className="auth-switch-text">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={onSwitchToSignup} className="auth-switch-link">
                    Join the adventure
                </button>
            </p>
        </motion.form>
    );
};

LoginForm.propTypes = {
    onForgotPassword: PropTypes.func.isRequired,
    onSwitchToSignup: PropTypes.func.isRequired,
    onLoginSuccess: PropTypes.func.isRequired,
};

// Signup Form Component
const SignupForm = ({ onSwitchToLogin, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await authAPI.signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });
            
            authAPI.setToken(response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            onLoginSuccess(response.user);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="auth-form"
        >
            <h2 className="auth-title">Create Account ✨</h2>
            <p className="auth-subtitle">Start your learning journey today</p>

            <AuthInput
                icon="person"
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
            />

            <AuthInput
                icon="mail"
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
            />

            <AuthInput
                icon="phone"
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
            />

            <AuthInput
                icon="lock"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />

            <AuthInput
                icon="lock"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-button auth-button-signup" disabled={loading}>
                <span className="material-symbols-outlined">{loading ? 'hourglass_empty' : 'auto_awesome'}</span>
                {loading ? 'Creating your universe...' : 'Join StudyVerse 🌟'}
            </button>

            <p className="auth-switch-text">
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToLogin} className="auth-switch-link">
                    Login
                </button>
            </p>
        </motion.form>
    );
};

SignupForm.propTypes = {
    onSwitchToLogin: PropTypes.func.isRequired,
    onLoginSuccess: PropTypes.func.isRequired,
};

// Forgot Password Form Component
const ForgotPasswordForm = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Connect to backend password reset
        console.log('Password reset requested for:', email);
        setSubmitted(true);
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="auth-form"
        >
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
                {submitted
                    ? 'Check your email for reset instructions'
                    : 'Enter your email to receive reset instructions'}
            </p>

            {!submitted && (
                <>
                    <AuthInput
                        icon="mail"
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button type="submit" className="auth-button">
                        <span className="material-symbols-outlined">send</span>
                        Send Reset Link
                    </button>
                </>
            )}

            {submitted && (
                <div className="auth-success-message">
                    <span className="material-symbols-outlined">check_circle</span>
                    <p>Password reset email sent!</p>
                </div>
            )}

            <button type="button" onClick={onBackToLogin} className="auth-back-link">
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Login
            </button>
        </motion.form>
    );
};

ForgotPasswordForm.propTypes = {
    onBackToLogin: PropTypes.func.isRequired,
};

// Floating cosmic elements for left panel
const cosmicElements = [
    { emoji: '🚀', style: { top: '15%', left: '20%', fontSize: '3rem' }, animClass: 'animate-float' },
    { emoji: '📚', style: { top: '60%', right: '15%', fontSize: '2.5rem' }, animClass: 'animate-float-slow' },
    { emoji: '⭐', style: { top: '30%', right: '25%', fontSize: '2rem' }, animClass: 'animate-twinkle' },
    { emoji: '🪐', style: { bottom: '20%', left: '15%', fontSize: '3rem' }, animClass: 'animate-float-reverse' },
    { emoji: '💫', style: { top: '45%', left: '50%', fontSize: '1.5rem' }, animClass: 'animate-twinkle' },
    { emoji: '🌟', style: { bottom: '35%', right: '30%', fontSize: '1.5rem' }, animClass: 'animate-float' },
];

// Main Auth Page Component
const Auth = () => {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'

    const handleLoginSuccess = (user) => {
        navigate('/dashboard');
    };

    return (
        <div className="auth-container">
            {/* Left Panel - Decorative */}
            <div className="auth-left-panel">
                {/* Cosmic orbs */}
                <div className="cosmic-orb cosmic-orb-1" />
                <div className="cosmic-orb cosmic-orb-2" />
                
                {/* Floating elements */}
                <div className="auth-floating-elements">
                    {cosmicElements.map((el, i) => (
                        <motion.div
                            key={i}
                            className={el.animClass}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.7, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: 'backOut' }}
                            style={{ position: 'absolute', ...el.style }}
                        >
                            {el.emoji}
                        </motion.div>
                    ))}
                </div>
                
                {/* Left content */}
                <motion.div
                    className="auth-left-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <h1 className="auth-left-title">
                        Your Learning{' '}
                        <span className="gradient-text">Universe</span>
                        {' '}Awaits
                    </h1>
                    <p className="auth-left-subtitle">
                        Watch videos, ask questions to AI, take fun quizzes, earn XP, and become a knowledge explorer!
                    </p>
                </motion.div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="auth-right-panel">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                    <span className="auth-logo-text">StudyVerse</span>
                </div>

                {/* Auth Card */}
                <div className="auth-card">
                    <AnimatePresence mode="wait">
                        {authMode === 'login' && (
                            <LoginForm
                                key="login"
                                onForgotPassword={() => setAuthMode('forgot')}
                                onSwitchToSignup={() => setAuthMode('signup')}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        )}
                        {authMode === 'signup' && (
                            <SignupForm
                                key="signup"
                                onSwitchToLogin={() => setAuthMode('login')}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        )}
                        {authMode === 'forgot' && (
                            <ForgotPasswordForm
                                key="forgot"
                                onBackToLogin={() => setAuthMode('login')}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="auth-footer">
                    © 2026 StudyVerse. Made with ❤️ for curious minds.
                </p>
            </div>
        </div>
    );
};

export default Auth;
