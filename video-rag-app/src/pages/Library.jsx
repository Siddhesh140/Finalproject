import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideos } from '../context'
import { Sidebar } from '../components'

export default function Library() {
    const { videos, loading, error, fetchVideos, deleteVideo } = useVideos()
    const [filter, setFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    const filteredVideos = videos.filter(video => {
        const matchesFilter = filter === 'all' || 
            (filter === 'youtube' && video.source_type === 'youtube') ||
            (filter === 'upload' && video.source_type === 'upload')
        const matchesSearch = !searchQuery || 
            video.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleDelete = async (id) => {
        try {
            await deleteVideo(id)
            setConfirmDelete(null)
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="main-content" style={{ flex: 1, paddingBottom: '80px', position: 'relative' }}>
                <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="page-header" 
                        style={{ marginBottom: '2.5rem' }}
                    >
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📚</span> My Library
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {videos.length} awesome videos in your collection! ✨
                        </p>
                    </motion.div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="search-bar glass-card" style={{ flex: 1, minWidth: 250, borderRadius: '24px', display: 'flex', padding: '0.75rem 1.5rem', border: '2px solid rgba(139, 92, 246, 0.2)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="Find a video..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, marginLeft: '1rem', fontSize: '1.1rem', color: 'var(--text)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            {['all', 'youtube', 'upload'].map((f) => (
                                <motion.button 
                                    key={f}
                                    whileTap={{ scale: 0.95 }}
                                    className={`tab ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                    style={{ 
                                        borderRadius: '16px', 
                                        fontWeight: 600,
                                        padding: '0.75rem 1.5rem',
                                        background: filter === f ? 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)' : 'transparent',
                                        color: filter === f ? 'white' : 'var(--text-secondary)'
                                    }}
                                >
                                    {f === 'all' ? '🌈 All' : f === 'youtube' ? '🔴 YouTube' : '📁 Uploads'}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Video Grid */}
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <div className="app-loading"></div>
                        </div>
                    ) : filteredVideos.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card" 
                            style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '32px' }}
                        >
                            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏜️</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No videos found!</div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {searchQuery 
                                    ? 'Try looking for something else!' 
                                    : 'Start adding cool videos!'}
                            </p>
                            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '100px', background: 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)', textDecoration: 'none' }}>
                                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>➕</span>
                                Find a Video
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div layout className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            <AnimatePresence>
                                {filteredVideos.map(video => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ scale: 1.03, y: -5 }}
                                        key={video.id} 
                                        className="glass-card" 
                                        style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden' }}
                                    >
                                        <Link to={`/player/${video.id}`} style={{ textDecoration: 'none' }}>
                                            <div style={{ aspectRatio: '16/9', background: 'var(--surface-hover)', position: 'relative' }}>
                                                {video.thumbnail_url ? (
                                                    <img src={video.thumbnail_url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: '3rem' }}>▶️</span>
                                                    </div>
                                                )}
                                                {video.duration && (
                                                    <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                                    </span>
                                                )}
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: 8, 
                                                    left: 8,
                                                    background: video.source_type === 'youtube' ? 'rgba(255,0,0,0.9)' : 'var(--primary)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '100px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                                }}>
                                                    {video.source_type === 'youtube' ? '🔴 YT' : '📁 FILE'}
                                                </div>
                                            </div>
                                        </Link>
                                        <div style={{ padding: '1.25rem' }}>
                                            <Link to={`/player/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</div>
                                            </Link>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{new Date(video.created_at).toLocaleDateString()}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/player/${video.id}`)}
                                                        style={{ 
                                                            width: '36px', height: '36px',
                                                            border: 'none',
                                                            background: 'rgba(19, 127, 236, 0.1)',
                                                            color: '#137fec',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.2rem' }}>▶️</span>
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1, background: 'var(--error)', color: 'white' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setConfirmDelete(video.id)}
                                                        style={{ 
                                                            width: '36px', height: '36px',
                                                            border: 'none',
                                                            background: 'rgba(253, 111, 133, 0.1)',
                                                            color: '#FD6F85',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.2rem' }}>🗑️</span>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>

                                    {/* Delete Confirmation */}
                                    {confirmDelete === video.id && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.9)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem',
                                            borderRadius: 'var(--radius-lg)'
                                        }}>
                                            <p style={{ color: 'white', fontWeight: 500 }}>Delete this video?</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => handleDelete(video.id)}
                                                    className="btn"
                                                    style={{ background: 'var(--error)', color: 'white' }}
                                                >
                                                    Delete
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="btn btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    )
}