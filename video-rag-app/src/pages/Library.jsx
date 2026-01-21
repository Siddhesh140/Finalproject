import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideos } from '../context'
import { Header, VideoCard, BottomNavLibrary, PageLoader, ErrorMessage, EmptyState } from '../components'

export default function Library() {
    const { videos, loading, error, fetchVideos, deleteVideo } = useVideos()
    const [activeTab, setActiveTab] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const tabs = ['All', 'Processed', 'Processing', 'Failed']

    // Fetch videos on mount
    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    // Filter videos based on tab and search
    const filteredVideos = videos.filter((video) => {
        // Tab filter
        if (activeTab === 'Processed' && video.status !== 'completed') return false
        if (activeTab === 'Processing' && !['pending', 'processing'].includes(video.status)) return false
        if (activeTab === 'Failed' && video.status !== 'failed') return false

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return video.title?.toLowerCase().includes(query)
        }

        return true
    })

    const handleDelete = async (e, videoId) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this video?')) {
            try {
                await deleteVideo(videoId)
            } catch (err) {
                console.error('Failed to delete:', err)
            }
        }
    }

    return (
        <div className="min-h-screen bg-background-light">
            <Header
                title="Library"
                icon={{ name: 'video_library', bg: 'bg-primary/10', color: 'text-primary' }}
            />

            {/* Sub-header with Search and Tabs */}
            <div className="glass border-none sticky top-[72px] z-10 transition-all">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    {/* SearchBar */}
                    <div className="py-4">
                        <label className="flex flex-col max-w-2xl h-12 w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full overflow-hidden shadow-sm border border-slate-200">
                                <div className="text-[#4c739a] flex bg-[#f0f4f8] items-center justify-center pl-4">
                                    <span className="material-symbols-outlined text-xl">search</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex w-full min-w-0 flex-1 border-none bg-[#f0f4f8] text-[#0d141b] focus:ring-0 focus:outline-none h-full placeholder:text-[#4c739a] px-4 pl-2 text-base font-normal leading-normal"
                                    placeholder="Search your videos..."
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="px-3 text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab ? 'text-white shadow-lg shadow-primary/30' : 'text-gray-500 hover:bg-white/50'
                                    }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeLibraryTab"
                                        className="absolute inset-0 bg-primary rounded-full z-0"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab}
                                    {tab !== 'All' && (
                                        <span className={`text-xs ${activeTab === tab ? 'text-white/80' : 'text-gray-400'}`}>
                                            {videos.filter(v =>
                                                tab === 'Processed' ? v.status === 'completed' :
                                                    tab === 'Processing' ? ['pending', 'processing'].includes(v.status) :
                                                        tab === 'Failed' ? v.status === 'failed' : true
                                            ).length}
                                        </span>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-10">
                {loading && videos.length === 0 ? (
                    <PageLoader text="Loading your library..." />
                ) : error ? (
                    <ErrorMessage message={error} onRetry={fetchVideos} />
                ) : filteredVideos.length === 0 ? (
                    <EmptyState
                        icon={searchQuery ? 'search_off' : 'video_library'}
                        title={searchQuery ? 'No results found' : 'Your library is empty'}
                        message={
                            searchQuery
                                ? `No videos match "${searchQuery}"`
                                : 'Start by processing a video from the dashboard'
                        }
                        action={
                            !searchQuery
                                ? { label: 'Add Video', icon: 'add', onClick: () => (window.location.href = '/dashboard') }
                                : undefined
                        }
                    />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                        <AnimatePresence>
                            {filteredVideos.map((video) => (
                                <motion.div
                                    key={video.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <VideoCard video={video} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNavLibrary />
            </div>

            {/* Floating Action Button */}
            <Link
                to="/dashboard"
                className="fixed bottom-24 md:bottom-8 right-6 lg:right-10 flex items-center justify-center size-14 lg:size-16 rounded-full bg-primary text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-2xl lg:text-3xl">add</span>
            </Link>
        </div>
    )
}
