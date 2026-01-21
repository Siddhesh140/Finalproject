import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideos, useChat } from '../context'
import { videoAPI } from '../services/api'
import { Header, PageLoader, ErrorMessage } from '../components'

export default function Player() {
    const navigate = useNavigate()
    const { videoId } = useParams()
    const { videos, currentVideo, setCurrentVideo, fetchVideos } = useVideos()
    const { messages, loading: chatLoading, sendMessage, initChat } = useChat()

    const [activeTab, setActiveTab] = useState('Chat')
    const [chatInput, setChatInput] = useState('')
    const [videoLoading, setVideoLoading] = useState(true)

    // Notes State
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')

    const chatEndRef = useRef(null)
    const videoRef = useRef(null)
    const tabs = ['Chat', 'Transcript', 'Notes', 'Quiz']

    // Load video data
    useEffect(() => {
        const loadVideo = async () => {
            setVideoLoading(true)

            // If we have videos in state, find the current one
            if (videos.length > 0) {
                const video = videos.find(v => v.id === videoId)
                if (video) {
                    setCurrentVideo(video)
                    await initChat(videoId)
                    setVideoLoading(false)
                    return
                }
            }

            // Otherwise fetch all videos
            await fetchVideos()
            setVideoLoading(false)
        }

        if (videoId) {
            loadVideo()
        } else {
            setVideoLoading(false)
        }
    }, [videoId, videos.length])

    // Fetch notes when video changes
    useEffect(() => {
        const fetchNotes = async () => {
            if (!videoId) return
            try {
                const data = await videoAPI.getNotes(videoId)
                setNotes(data)
            } catch (err) {
                console.error('Failed to fetch notes:', err)
            }
        }
        fetchNotes()
    }, [videoId])

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!chatInput.trim() || chatLoading) return

        const message = chatInput.trim()
        setChatInput('')

        try {
            await sendMessage(message)
        } catch (err) {
            console.error('Failed to send message:', err)
        }
    }

    // Notes Handlers
    const addNote = async () => {
        if (!newNote.trim() || !videoId) return

        const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0

        try {
            const note = await videoAPI.createNote(videoId, newNote.trim(), currentTime)
            setNotes(prev => [note, ...prev])
            setNewNote('')
        } catch (err) {
            console.error('Failed to create note:', err)
        }
    }

    const deleteNote = async (id) => {
        if (!videoId) return
        try {
            await videoAPI.deleteNote(videoId, id)
            setNotes(prev => prev.filter(n => n.id !== id))
        } catch (err) {
            console.error('Failed to delete note:', err)
        }
    }

    const jumpToTime = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds
            videoRef.current.play()
        }
    }

    const formatTimestamp = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (videoLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
                <Header title="Loading..." showBack onBack={() => navigate(-1)} />
                <PageLoader text="Loading video..." />
            </div>
        )
    }

    if (!currentVideo && videoId) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
                <Header title="Video Not Found" showBack onBack={() => navigate(-1)} />
                <ErrorMessage
                    message="The video you're looking for doesn't exist or has been deleted."
                    onRetry={() => navigate('/library')}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
            {/* Top Navigation */}
            <header className="sticky top-0 z-20 glass border-none">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined dark:text-white">arrow_back</span>
                        </button>
                        <h1 className="text-[#0d141b] dark:text-white text-lg lg:text-xl font-bold truncate max-w-[200px] lg:max-w-md">
                            {currentVideo?.title || 'Video Player'}
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium hover:scale-105 transform duration-200">Home</Link>
                        <Link to="/library" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium hover:scale-105 transform duration-200">Library</Link>
                        <Link to="/search" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium hover:scale-105 transform duration-200">Search</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">bookmark_border</span>
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                alert('Link copied to clipboard!')
                            }}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">share</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Two Column Layout on Desktop */}
            <main className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row">
                    {/* Video Section */}
                    <div className="lg:flex-1 lg:max-w-[65%] p-4 lg:p-6">
                        {/* Video Player */}
                        <div className="relative bg-gray-900 aspect-video rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
                            {currentVideo?.source_type === 'youtube' && currentVideo?.source_url ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${extractYouTubeId(currentVideo.source_url)}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : currentVideo?.file_path ? (
                                <video
                                    ref={videoRef}
                                    src={`http://localhost:8000${currentVideo.file_path}`}
                                    className="w-full h-full"
                                    controls
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-500 text-6xl">smart_display</span>
                                </div>
                            )}
                        </div>

                        {/* Video Info */}
                        <div className="mt-4 lg:mt-6 space-y-3">
                            <h2 className="text-xl lg:text-2xl font-bold text-[#0d141b] dark:text-white">
                                {currentVideo?.title || 'Video Title'}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                    {currentVideo?.duration ? formatTimestamp(currentVideo.duration) : '--:--'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${currentVideo?.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {currentVideo?.status || 'unknown'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons - Desktop */}
                        <div className="hidden lg:flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await videoAPI.toggleLike(currentVideo.id)
                                        setCurrentVideo(prev => ({ ...prev, is_liked: res.is_liked }))
                                    } catch (err) {
                                        console.error('Failed to toggle like:', err)
                                    }
                                }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${currentVideo?.is_liked
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-xl ${currentVideo?.is_liked ? 'fill-current' : ''}`}>thumb_up</span>
                                {currentVideo?.is_liked ? 'Liked' : 'Like'}
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                                <span className="material-symbols-outlined text-xl">download</span>
                                Download
                            </button>
                            <Link
                                to={`/quiz?videoId=${videoId}`}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">quiz</span>
                                Take Quiz
                            </Link>
                        </div>
                    </div>

                    {/* Chat/Tabs Section */}
                    <div className="lg:w-[35%] lg:min-h-[calc(100vh-80px)] flex flex-col bg-white lg:border-l border-gray-200">
                        {/* Tabs */}
                        <div className="border-b border-gray-100 sticky top-[72px] bg-white/90 backdrop-blur z-10 transition-all">
                            <div className="flex px-4 lg:px-6 gap-6 lg:gap-8">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative flex flex-col items-center justify-center py-4 transition-colors ${activeTab === tab
                                            ? 'text-primary'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <p className="text-sm font-bold tracking-wide z-10">{tab}</p>
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto bg-background-light p-4 lg:p-6">
                            {activeTab === 'Chat' && (
                                <div className="space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="material-symbols-outlined text-4xl mb-2 block">chat</span>
                                            <p className="text-sm">Ask questions about this video</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                                            >
                                                {msg.role !== 'user' && (
                                                    <div className="bg-primary rounded-full size-8 shrink-0 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                                                    </div>
                                                )}
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-white border border-gray-100 shadow-sm rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    {msg.references && msg.references.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-xs text-gray-500 mb-1">References:</p>
                                                            {msg.references.map((ref, i) => (
                                                                <button
                                                                    key={i}
                                                                    className="text-xs text-primary hover:underline mr-2"
                                                                >
                                                                    {formatTimestamp(ref.start)} - {formatTimestamp(ref.end)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.role === 'user' && (
                                                    <div className="bg-gray-200 rounded-full size-8 shrink-0 flex items-center justify-center">
                                                        <span className="text-gray-600 text-sm font-bold">U</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    {/* Loading indicator */}
                                    {chatLoading && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <div className="flex gap-1">
                                                <div className="size-2 bg-gray-300 rounded-full animate-bounce"></div>
                                                <div className="size-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="size-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-sm">AI is thinking...</span>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            )}

                            {activeTab === 'Transcript' && (
                                <div className="prose prose-sm max-w-none">
                                    {currentVideo?.transcript ? (
                                        <p className="text-gray-700 whitespace-pre-wrap">{currentVideo.transcript}</p>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">
                                            Transcript will appear here once video processing is complete.
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Notes' && (
                                <div className="space-y-6">
                                    {/* Add Note Input */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-800 mb-3">Add a Note</h3>
                                        <div className="flex flex-col gap-3">
                                            <textarea
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Type your note here..."
                                                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none h-24"
                                            />
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => {
                                                        const time = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
                                                        setNewNote(prev => prev + (prev ? '\n' : '') + `[${formatTimestamp(time)}] `)
                                                    }}
                                                    className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                    Insert Timestamp
                                                </button>
                                                <button
                                                    onClick={addNote}
                                                    disabled={!newNote.trim()}
                                                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Save Note
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes List */}
                                    <div className="space-y-3">
                                        <AnimatePresence initial={false}>
                                            {notes.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-center py-8 text-gray-500"
                                                >
                                                    <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">edit_note</span>
                                                    <p className="text-sm">No notes yet. Add one above!</p>
                                                </motion.div>
                                            ) : (
                                                notes.map((note) => (
                                                    <motion.div
                                                        key={note.id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <button
                                                                    onClick={() => jumpToTime(note.timestamp)}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium mb-2 hover:bg-primary/20 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-[10px]">play_arrow</span>
                                                                    {formatTimestamp(note.timestamp)}
                                                                </button>
                                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteNote(note.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-2 text-right">
                                                            {new Date(note.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Quiz' && (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-4xl mb-2 block text-primary">quiz</span>
                                    <p className="text-gray-700 font-medium mb-2">Test your knowledge</p>
                                    <p className="text-gray-500 text-sm mb-4">Generate a quiz based on this video</p>
                                    <Link
                                        to={`/quiz?videoId=${videoId}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">play_arrow</span>
                                        Start Quiz
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        {activeTab === 'Chat' && (
                            <form onSubmit={handleSendMessage} className="p-4 lg:p-6 bg-white border-t border-gray-100">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        disabled={chatLoading || currentVideo?.status !== 'completed'}
                                        className="w-full h-12 lg:h-14 pl-4 pr-14 rounded-full border border-gray-200 bg-gray-50 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                                        placeholder={
                                            currentVideo?.status !== 'completed'
                                                ? 'Video processing in progress...'
                                                : 'Ask a question about the video...'
                                        }
                                    />
                                    <button
                                        type="submit"
                                        disabled={chatLoading || !chatInput.trim() || currentVideo?.status !== 'completed'}
                                        className="absolute right-1.5 size-10 lg:size-11 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-xl">send</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url?.match(regex)
    return match ? match[1] : null
}
