import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideos } from '../context'
import { searchAPI } from '../services/api'
import { Header, VideoCard, BottomNavSearch, PageLoader, ErrorMessage, EmptyState } from '../components'

export default function Search() {
    const { videos, fetchVideos } = useVideos()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [recentSearches, setRecentSearches] = useState([])

    const filters = ['All', 'Videos', 'Transcripts', 'Notes', 'Quizzes']

    // Load videos for local search fallback
    useEffect(() => {
        if (videos.length === 0) {
            fetchVideos()
        }

        // Load recent searches from localStorage
        const saved = localStorage.getItem('recentSearches')
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5))
        }
    }, [])

    // Debounced search
    const performSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        setLoading(true)
        setError('')

        try {
            // Try API search first
            const response = await searchAPI.search(searchQuery, { limit: 20 })
            setResults(response.results || [])

            // Save to recent searches
            const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
            setRecentSearches(newRecent)
            localStorage.setItem('recentSearches', JSON.stringify(newRecent))
        } catch (err) {
            // Fallback to local video search
            const query = searchQuery.toLowerCase()
            const localResults = videos
                .filter(v => v.title?.toLowerCase().includes(query))
                .map(v => ({
                    video_id: v.id,
                    video_title: v.title,
                    text: v.title,
                    timestamp_start: 0,
                    timestamp_end: 0,
                    relevance_score: 1
                }))
            setResults(localResults)
        } finally {
            setLoading(false)
        }
    }, [searchQuery, videos, recentSearches])

    // Trigger search on query change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch()
            } else if (searchQuery.length === 0) {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleRecentClick = (query) => {
        setSearchQuery(query)
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('recentSearches')
    }

    const formatTimestamp = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-background-light">
            <Header
                title="Search"
                icon={{ name: 'search', bg: 'bg-primary/10', color: 'text-primary' }}
            />

            {/* Search Bar Section */}
            <div className="glass sticky top-[72px] z-10 transition-all border-none">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
                    <div className="flex items-center gap-4 max-w-3xl">
                        <label className="flex flex-col h-12 lg:h-14 w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full border border-gray-200 shadow-sm overflow-hidden">
                                <div className="text-[#4c739a] flex bg-[#e7edf3] items-center justify-center pl-4 lg:pl-5">
                                    <span className="material-symbols-outlined text-xl">search</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#0d141b] focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-[#e7edf3] h-full placeholder:text-[#4c739a] px-4 pl-3 text-base font-normal leading-normal"
                                    placeholder="Search videos, transcripts, notes..."
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="px-3 bg-[#e7edf3] text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>
                        </label>
                        <button
                            onClick={performSearch}
                            className="hidden lg:flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">search</span>
                            Search
                        </button>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === filter
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Results */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <PageLoader text="Searching..." />
                        ) : error ? (
                            <ErrorMessage message={error} onRetry={performSearch} />
                        ) : searchQuery && results.length === 0 ? (
                            <EmptyState
                                icon="search_off"
                                title="No results found"
                                message={`We couldn't find anything for "${searchQuery}"`}
                            />
                        ) : results.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 mb-4">
                                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                                </p>

                                {results.map((result, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={`/player/${result.video_id}`}
                                            className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                                        >
                                            <div className="w-full md:w-48 lg:w-56 aspect-video bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:shadow-glow transition-all duration-500">
                                                <span className="material-symbols-outlined text-gray-400 text-4xl group-hover:scale-110 transition-transform duration-500">smart_display</span>
                                            </div>
                                            <div className="flex flex-col justify-center gap-2 flex-1">
                                                <h3 className="font-semibold text-[#0d141b] group-hover:text-primary transition-colors">{result.video_title}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{result.text}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {result.timestamp_start > 0 && (
                                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                                            {formatTimestamp(result.timestamp_start)} - {formatTimestamp(result.timestamp_end)}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                        {Math.round(result.relevance_score * 100)}% match
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            // No search yet - show recent videos
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Recent Videos</h3>
                                {videos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {videos.slice(0, 4).map((video) => (
                                            <VideoCard key={video.id} video={video} variant="list" />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon="video_library"
                                        title="No videos yet"
                                        message="Process your first video to start searching"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Recent & Suggestions */}
                    <div className="hidden lg:block space-y-6">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">Recent Searches</h3>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {recentSearches.map((query, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecentClick(query)}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 w-full text-left"
                                        >
                                            <span className="material-symbols-outlined text-gray-400">history</span>
                                            <span className="text-sm text-gray-700 truncate">{query}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested Topics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold mb-4">Popular Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'React', 'Python', 'Data Science', 'Web Dev'].map((topic) => (
                                    <button
                                        key={topic}
                                        onClick={() => setSearchQuery(topic)}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNavSearch />
            </div>
        </div>
    )
}
