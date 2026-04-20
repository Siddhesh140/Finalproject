import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useVideos, useTheme, useAuth } from '../context'
import { Sidebar } from '../components'

export default function Profile() {
    const navigate = useNavigate()
    const { videos } = useVideos()
    const { isDarkMode, toggleDarkMode } = useTheme()
    const { user, logout } = useAuth()

    const [userData, setUserData] = useState(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try { return JSON.parse(stored) } catch {}
        }
        return { name: 'User', email: 'user@example.com' }
    })

    const handleLogout = () => {
        logout()
        navigate('/auth')
    }

    const stats = {
        videos: videos.length,
        xp: videos.length * 100 + 250,
        streak: 4
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="main-content" style={{ flex: 1, paddingBottom: '80px', position: 'relative' }}>
                <div className="page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="page-header" 
                        style={{ marginBottom: '2.5rem', textAlign: 'center' }}
                    >
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>👨‍🚀</span> Space Cadet Profile
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Track your learning adventure stats!
                        </p>
                    </motion.div>

                    {/* User Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" 
                        style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '3rem 2rem', borderRadius: '32px' }}
                    >
                        <div style={{ 
                            width: 100, 
                            height: 100, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '3rem',
                            color: 'white',
                            fontWeight: 800,
                            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                        }}>
                            {userData.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text)' }}>
                            {userData.name || 'User'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>
                            {userData.email || 'user@example.com'}
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}
                    >
                        <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '24px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{stats.videos}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Videos Saved</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(19, 127, 236, 0.1) 100%)', border: '2px solid rgba(139, 92, 246, 0.3)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>{stats.xp}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Power XP</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '24px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FD6F85' }}>{stats.streak}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Day Streak</div>
                        </div>
                    </motion.div>

                    {/* Settings */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card" 
                        style={{ marginBottom: '2rem', borderRadius: '24px', padding: '2rem' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚙️</span> Mission Control
                        </h3>
                        
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'var(--surface-hover)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{isDarkMode ? '🌙' : '☀️'}</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{isDarkMode ? 'Night Mode' : 'Light Mode'}</span>
                            </div>
                            <div style={{ 
                                width: 50, 
                                height: 28, 
                                background: isDarkMode ? '#8b5cf6' : 'var(--text-muted)', 
                                borderRadius: 100,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 4
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={isDarkMode} 
                                    onChange={toggleDarkMode}
                                    style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                                />
                                <motion.div 
                                    animate={{ x: isDarkMode ? 22 : 0 }}
                                    style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                />
                            </div>
                        </label>
                    </motion.div>

                    {/* Logout */}
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        style={{ 
                            width: '100%', 
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            borderRadius: '16px',
                            background: 'var(--surface-hover)',
                            border: '2px solid rgba(253, 111, 133, 0.3)',
                            color: '#FD6F85',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>🚪</span>
                        Log Out of StudyaVerse
                    </motion.button>
                </div>
            </main>
        </div>
    )
}