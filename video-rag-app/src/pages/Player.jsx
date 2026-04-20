import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useVideos, useChat } from '../context'

export default function Player() {
    const navigate = useNavigate()
    const { videoId } = useParams()
    const { videos, currentVideo, setCurrentVideo, fetchVideos } = useVideos()
    const { messages, loading: chatLoading, sendMessage, initChat } = useChat()

    const [activeTab, setActiveTab] = useState('chat')
    const [chatInput, setChatInput] = useState('')
    const [videoLoading, setVideoLoading] = useState(true)
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)

    const chatEndRef = useRef(null)
    const videoRef = useRef(null)

    useEffect(() => {
        const loadVideo = async () => {
            setVideoLoading(true)
            if (videoId) {
                const found = videos.find(v => v.id === videoId)
                if (found) {
                    setCurrentVideo(found)
                    initChat(videoId)
                }
            }
            setVideoLoading(false)
        }
        loadVideo()
    }, [videoId, videos])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!chatInput.trim() || sendingMessage) return
        
        setSendingMessage(true)
        try {
            await sendMessage(chatInput)
            setChatInput('')
        } catch (err) {
            console.error('Failed to send message:', err)
        } finally {
            setSendingMessage(false)
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim()) return
        const timestamp = videoRef.current?.currentTime || 0
        setNotes([...notes, { content: newNote, timestamp, created_at: new Date().toISOString() }])
        setNewNote('')
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (videoLoading || !currentVideo) {
        return (
            <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header style={{ 
                position: 'sticky', 
                top: 0, 
                background: 'var(--surface)', 
                borderBottom: '1px solid var(--border)',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 100
            }}>
<button 
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none', 
                            border: 'none', 
                            cursor:'pointer',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)'
                        }}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                <h1 style={{ flex: 1, fontSize: '1.1rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentVideo.title}
                </h1>
                <Link to={`/quiz?videoId=${currentVideo.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>quiz</span>
                    Quiz
                </Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', height: 'calc(100vh - 65px)' }}>
                {/* Video Player */}
                <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentVideo.source_url || currentVideo.file_path ? (
                        <iframe
                            ref={videoRef}
                            src={currentVideo.source_type === 'youtube' 
                                ? (() => {
                                    const url = currentVideo.source_url || '';
                                    // Handle youtu.be format
                                    if (url.includes('youtu.be/')) {
                                        const match = url.match(/youtu\.be\/([^?&]+)/);
                                        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
                                    }
                                    // Handle youtube.com format
                                    const vMatch = url.split('v=')[1];
                                    return vMatch ? `https://www.youtube.com/embed/${vMatch.split('&')[0]}` : null;
                                })()
                                : undefined
                            }
                            title={currentVideo.title}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div style={{ textAlign: 'center', color: 'white' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>play_circle</span>
                            <p>Video player</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ 
                    background: 'var(--surface)', 
                    borderLeft: '1px solid var(--border)',
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                        {['chat', 'notes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: 'none',
                                    background: activeTab === tab ? 'var(--surface)' : 'transparent',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {activeTab === 'chat' ? (
                            <>
                                {/* Messages */}
                                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                                    {messages.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>chat</span>
                                            <p style={{ marginTop: '0.5rem' }}>Ask questions about this video</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div 
                                                key={i} 
                                                style={{ 
                                                    marginBottom: '1rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                                }}
                                            >
                                                <div style={{
                                                    maxWidth: '85%',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: 'var(--radius-lg)',
                                                    background: msg.role === 'user' 
                                                        ? 'var(--primary)' 
                                                        : 'var(--surface-hover)',
                                                    color: msg.role === 'user' ? 'white' : 'var(--text)'
                                                }}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {chatLoading && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                            <div className="loading-spinner" style={{ width: 20, height: 20 }}></div>
                                            <span>Thinking...</span>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Ask about this video..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            disabled={sendingMessage}
                                        />
                                        <button type="submit" className="btn btn-primary" disabled={sendingMessage || !chatInput.trim()}>
                                            <span className="material-symbols-outlined">send</span>
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Notes */}
                                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                                    {notes.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>note</span>
                                            <p style={{ marginTop: '0.5rem' }}>No notes yet</p>
                                        </div>
                                    ) : (
                                        notes.map((note, i) => (
                                            <div 
                                                key={i} 
                                                className="card" 
                                                style={{ padding: '0.75rem', marginBottom: '0.75rem' }}
                                            >
                                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                                                    {formatTime(note.timestamp)}
                                                </div>
                                                <div>{note.content}</div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Note */}
                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Add a note..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                        />
                                        <button type="button" className="btn btn-primary" onClick={handleAddNote}>
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile: Stack layout */}
            <div className="mobile-nav" style={{ display: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div style={{ aspectRatio: '16/9', background: '#000' }}></div>
                    <div style={{ padding: '1rem', background: 'var(--surface)' }}>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentVideo.title}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}