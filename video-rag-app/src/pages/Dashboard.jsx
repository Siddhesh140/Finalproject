import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useVideos } from '../context'
import { Sidebar } from '../components'

export default function Dashboard() {
    const { videos, loading, error, fetchVideos, processVideoUrl, uploadVideo } = useVideos()
    const [mode, setMode] = useState('link')
    const [videoUrl, setVideoUrl] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const fileInputRef = useRef(null)

    const [user, setUser] = useState({ name: 'Explorer', xp: 1250, streak: 4 })

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser)
                setUser(prev => ({ ...prev, name: parsed.name?.split(' ')[0] || 'Explorer' }))
            } catch (e) {}
        }
    }, [])

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')
        setSubmitting(true)

        try {
            if (mode === 'link') {
                if (!videoUrl.trim()) {
                    setSubmitError('Please enter a video URL')
                    setSubmitting(false)
                    return
                }
                await processVideoUrl(videoUrl, videoTitle || undefined)
                setVideoUrl('')
                setVideoTitle('')
            } else {
                if (!selectedFile) {
                    setSubmitError('Please select a video file')
                    setSubmitting(false)
                    return
                }
                await uploadVideo(selectedFile, videoTitle || undefined)
                setSelectedFile(null)
                setVideoTitle('')
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        } catch (err) {
            setSubmitError(err.message || 'Failed to process video')
        } finally {
            setSubmitting(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            if (!videoTitle) setVideoTitle(file.name.replace(/\.[^/.]+$/, ''))
        }
    }

    const recentVideos = videos.slice(0, 6)

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--app-bg)' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="app-main" style={{ flex: 1, paddingBottom: '80px' }}>
                <div className="app-container" style={{ padding: '2rem' }}>
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="page-header" 
                        style={{ marginBottom: '3rem' }}
                    >
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--app-text)', marginBottom: '0.5rem' }}>
                            Welcome back, {user.name}! 🚀
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--app-text-secondary)', fontWeight: 500 }}>
                            Ready to start your next learning adventure? Let's go! ✨
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <motion.div whileHover={{ scale: 1.05 }} className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '3rem' }}>⚡</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Power XP</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.xp}</div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '3rem' }}>🔥</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Daily Streak</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FD6F85' }}>{user.streak} Days</div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '3rem' }}>📼</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Library Collection</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#17DECA' }}>{videos.length} Videos</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                        {/* Add Video */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>➕</span>
                                Bring a Video!
                            </h2>
                            
                            <div className="tabs" style={{ marginBottom: '1.5rem', background: 'var(--app-bg)', padding: '0.5rem', borderRadius: '16px' }}>
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    className={`tab ${mode === 'link' ? 'active' : ''}`}
                                    onClick={() => setMode('link')}
                                    style={{ borderRadius: '12px', fontWeight: 600 }}
                                >
                                    🔗 Link
                                </motion.button>
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    className={`tab ${mode === 'upload' ? 'active' : ''}`}
                                    onClick={() => setMode('upload')}
                                    style={{ borderRadius: '12px', fontWeight: 600 }}
                                >
                                    ☁️ Upload
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {mode === 'link' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <input
                                            type="text"
                                            className="app-input"
                                            placeholder="Paste YouTube URL..."
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            style={{ borderRadius: '16px', padding: '1rem', border: '2px solid var(--app-border)' }}
                                        />
                                        <input
                                            type="text"
                                            className="app-input"
                                            placeholder="Video title (optional)"
                                            value={videoTitle}
                                            onChange={(e) => setVideoTitle(e.target.value)}
                                            style={{ borderRadius: '16px', padding: '1rem', border: '2px solid var(--app-border)' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ 
                                                border: '2px dashed #137fec', 
                                                borderRadius: '16px', 
                                                padding: '2rem', 
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: 'rgba(19, 127, 236, 0.05)'
                                            }}
                                        >
                                            <input 
                                                ref={fileInputRef}
                                                type="file" 
                                                accept="video/*" 
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>☁️</div>
                                            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                {selectedFile ? selectedFile.name : 'Tap to select a cool video file!'}
                                            </p>
                                        </motion.div>
                                        {selectedFile && (
                                            <input
                                                type="text"
                                                className="app-input"
                                                placeholder="Video title (optional)"
                                                value={videoTitle}
                                                onChange={(e) => setVideoTitle(e.target.value)}
                                                style={{ borderRadius: '16px', padding: '1rem', border: '2px solid var(--app-border)' }}
                                            />
                                        )}
                                    </div>
                                )}

                                {submitError && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{ 
                                            padding: '1rem', 
                                            background: 'rgba(253,111,133,0.1)', 
                                            color: '#FD6F85',
                                            borderRadius: '16px',
                                            marginTop: '1.25rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            border: '1px solid rgba(253,111,133,0.3)'
                                        }}
                                    >
                                        ⚠️ {submitError}
                                    </motion.div>
                                )}

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    className="app-btn app-btn-primary" 
                                    style={{ 
                                        width: '100%', 
                                        marginTop: '1.5rem', 
                                        padding: '1rem', 
                                        borderRadius: '16px',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)'
                                    }}
                                    disabled={submitting}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{submitting ? '⏳' : '✨'}</span>
                                    {submitting ? 'Processing Magic...' : 'Start Adventure!'}
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Recent Videos */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🎬</span>
                                    Recent Adventures
                                </h2>
                                <Link to="/library" style={{ color: '#137fec', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700, background: 'rgba(19, 127, 236, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px' }}>
                                    See All ✨
                                </Link>
                            </div>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <div className="app-loading"></div>
                                </div>
                            ) : recentVideos.length === 0 ? (
                                <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏜️</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No adventures yet!</div>
                                    <p style={{ color: 'var(--text-secondary)' }}>Add your first video to start learning</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                    {recentVideos.map(video => (
                                        <Link to={`/player/${video.id}`} key={video.id} style={{ textDecoration: 'none' }}>
                                            <motion.div whileHover={{ scale: 1.03, y: -5 }} className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                                <div style={{ aspectRatio: '16/9', background: 'var(--app-surface-hover)', position: 'relative' }}>
                                                    {video.thumbnail_url ? (
                                                        <img src={video.thumbnail_url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span style={{ fontSize: '3rem' }}>▶️</span>
                                                        </div>
                                                    )}
                                                    {video.duration && (
                                                        <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--app-text)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--app-text-secondary)', fontWeight: 500 }}>
                                                        {video.source_type === 'youtube' ? '🔴 YouTube' : '📁 Upload'} • {new Date(video.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
