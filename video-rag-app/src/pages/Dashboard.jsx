import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useVideos } from '../context'
import { Header, VideoCard, BottomNavDashboard, PageLoader, ErrorMessage, EmptyState, ButtonLoader } from '../components'

export default function Dashboard() {
    const { videos, loading, error, fetchVideos, processVideoUrl, uploadVideo } = useVideos()
    const [mode, setMode] = useState('link') // 'link' or 'upload'
    const [videoUrl, setVideoUrl] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const fileInputRef = useRef(null)

    // Fetch videos on mount
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
                await uploadVideo(selectedFile, videoTitle || selectedFile.name)
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
            if (!videoTitle) {
                setVideoTitle(file.name.replace(/\.[^/.]+$/, ''))
            }
        }
    }

    const recentVideos = videos.slice(0, 6)

    return (
        <div className="min-h-screen bg-background-light">
            <Header
                title="Video-RAG"
                icon={{ name: 'smart_display', bg: 'bg-primary', color: 'text-white' }}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10 pb-24 md:pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* New Analysis Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <h2 className="text-[#0d141b] text-xl lg:text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 pl-1">
                            New Analysis
                        </h2>
                        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-glow">
                            {/* Mode Toggle */}
                            <div className="flex mb-5">
                                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#e7edf3] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setMode('link')}
                                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-semibold transition-all ${mode === 'link'
                                            ? 'bg-white shadow-sm text-[#0d141b]'
                                            : 'text-[#4c739a] hover:bg-white/50'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg mr-2">link</span>
                                        Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('upload')}
                                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-semibold transition-all ${mode === 'upload'
                                            ? 'bg-white shadow-sm text-[#0d141b]'
                                            : 'text-[#4c739a] hover:bg-white/50'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg mr-2">upload</span>
                                        Upload
                                    </button>
                                </div>
                            </div>

                            {/* Input Fields */}
                            {mode === 'link' ? (
                                <div className="flex flex-col gap-4 mb-5">
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="w-full rounded-xl text-[#0d141b] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdbe7] bg-white focus:border-primary h-14 placeholder:text-[#4c739a] px-4 text-base"
                                        placeholder="Paste YouTube or video link..."
                                    />
                                    <input
                                        type="text"
                                        value={videoTitle}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                        className="w-full rounded-xl text-[#0d141b] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdbe7] bg-white focus:border-primary h-12 placeholder:text-[#4c739a] px-4 text-sm"
                                        placeholder="Title (optional)"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 mb-5">
                                    {/* File Drop Zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#cfdbe7] rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                                        {selectedFile ? (
                                            <p className="text-sm text-[#0d141b] font-medium">{selectedFile.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm text-[#4c739a]">Click to upload or drag & drop</p>
                                                <p className="text-xs text-gray-400 mt-1">MP4, WebM, MOV (max 500MB)</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={videoTitle}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                        className="w-full rounded-xl text-[#0d141b] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdbe7] bg-white focus:border-primary h-12 placeholder:text-[#4c739a] px-4 text-sm"
                                        placeholder="Title (optional)"
                                    />
                                </div>
                            )}

                            {/* Error Message */}
                            {submitError && (
                                <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {submitError}
                                </p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 bg-primary text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <ButtonLoader />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                        Start Processing
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Recent Analyses Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[#0d141b] text-xl lg:text-2xl font-bold leading-tight tracking-tight">
                                Recent Analyses
                            </h2>
                            <Link to="/library" className="text-primary text-sm font-semibold hover:underline">
                                View All
                            </Link>
                        </div>

                        {/* Content States */}
                        {loading && videos.length === 0 ? (
                            <PageLoader text="Loading videos..." />
                        ) : error ? (
                            <ErrorMessage message={error} onRetry={fetchVideos} />
                        ) : videos.length === 0 ? (
                            <EmptyState
                                icon="video_library"
                                title="No videos yet"
                                message="Process your first video to get started with AI-powered analysis"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {recentVideos.map((video, index) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <VideoCard video={video} variant="list" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNavDashboard />
            </div>
        </div>
    )
}
