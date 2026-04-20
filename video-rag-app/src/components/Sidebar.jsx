import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context';

export default function Sidebar() {
    const location = useLocation();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '🚀' },
        { name: 'Library', path: '/library', icon: '📚' },
        { name: 'Search', path: '/search', icon: '🕵️‍♂️' },
        { name: 'Profile', path: '/profile', icon: '⭐' },
    ];

    const currentPath = location.pathname;

    return (
        <>
            <aside className="app-sidebar">
                <div className="app-sidebar-logo" style={{ color: 'var(--text)'}}>
                    <motion.div 
                        whileHover={{ rotate: 20, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        style={{ fontSize: '2rem' }}
                    >
                        📚
                    </motion.div>
                    <span style={{ 
                        background: 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        fontSize: '1.5rem'
                    }}>
                        StudyaVerse
                    </span>
                </div>

                <nav className="app-sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                        return (
                            <Link key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`app-sidebar-link ${isActive ? 'active' : ''}`}
                                    style={{ 
                                        borderRadius: '16px',
                                        background: isActive ? 'linear-gradient(135deg, rgba(19, 127, 236, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' : 'transparent',
                                        border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{item.icon}</span>
                                    {item.name}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--app-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleDarkMode}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', borderRadius: '16px' }}
                    >
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>
                            {isDarkMode ? '🌜' : '☀️'}
                        </span>
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </motion.button>
                     <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            localStorage.removeItem('user');
                            window.location.href = '/auth';
                        }}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', color: '#FD6F85', borderRadius: '16px' }}
                    >
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>👋</span>
                        Log Out
                    </motion.button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="mobile-nav" style={{ 
                position: 'fixed', 
                bottom: 0, left: 0, right: 0, 
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderTop: '1px solid var(--app-border)', 
                padding: '0.5rem', 
                zIndex: 100,
                boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
            }}>
                {navItems.map((item) => {
                    const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                    return (
                        <Link key={item.name} to={item.path} style={{ flex: 1, textDecoration: 'none' }}>
                            <motion.div 
                                whileTap={{ scale: 0.9 }} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    padding: '0.5rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', filter: isActive ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' : 'none' }}>
                                    {item.icon}
                                </span>
                                <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, marginTop: '4px' }}>
                                    {item.name}
                                </span>
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>
        </>
    );
}
