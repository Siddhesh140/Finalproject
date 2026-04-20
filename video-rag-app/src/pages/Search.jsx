import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideos } from '../context'
import { searchAPI } from '../services/api'
import { Sidebar } from '../components'

export default function Search() {
    const { videos, fetchVideos } = useVideos()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        fetchVideos()
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setLoading(true)
        setSearched(true)
        try {
            const response = await searchAPI.search(searchQuery)
            setResults(response.results || [])
        } catch (err) {
            console.error('Search failed:', err)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const localSearch = searchQuery.trim() === '' 
        ? [] 
        : videos.filter(v => 
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.transcript && v.transcript.toLowerCase().includes(searchQuery.toLowerCase()))
        )

    const displayResults = results.length > 0 ? results : localSearch

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
                            <span>🕵️</span> Super Search
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Find any video or topic across the entire StudyaVerse!
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={{ marginBottom: '2.5rem' }}>
                        <div className="search-bar glass-card" style={{ maxWidth: 800, borderRadius: '24px', display: 'flex', padding: '1rem 1.5rem', border: '2px solid rgba(139, 92, 246, 0.2)' }}>
                            <span style={{ fontSize: '1.8rem' }}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="What do you want to learn today?..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, marginLeft: '1rem', fontSize: '1.2rem', color: 'var(--text)' }}
                            />
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading}
                                style={{
                                    borderRadius: '100px', 
                                    padding: '0.75rem 2rem', 
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #137fec 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? <div className="app-loading" style={{ width: 20, height: 20 }}></div> : 'Search!'}
                            </motion.button>
                        </div>
                    </form>

                    {/* Results */}
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <div className="app-loading"></div>
                        </div>
                    ) : !searched ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card" 
                            style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '32px' }}
                        >
                            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔎</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ready to explore?</div>
                            <p style={{ color: 'var(--text-secondary)' }}>Type a keyword above and hit Search!</p>
                        </motion.div>
                    ) : displayResults.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card" 
                            style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '32px' }}
                        >
                            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>👽</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nothing found in this galaxy!</div>
                            <p style={{ color: 'var(--text-secondary)' }}>Try different keywords or check out something else.</p>
                        </motion.div>
                    ) : (
                        <motion.div layout>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 500 }}>
                                🎯 Found {displayResults.length} awesome match{displayResults.length !== 1 ? 'es' : ''}!
                            </p>
                            <motion.div layout className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                <AnimatePresence>
                                    {displayResults.map(video => (
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
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                                                    {new Date(video.created_at).toLocaleDateString()}
                                                </div>
                                                {video.transcript && (
                                                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
                                                        "{video.transcript}"
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    )
}