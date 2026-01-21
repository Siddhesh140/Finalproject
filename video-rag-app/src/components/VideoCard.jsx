import { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useVideos } from '../context'

export default function VideoCard({ video, variant = 'grid' }) {
    const { deleteVideo } = useVideos()
    const [showMenu, setShowMenu] = useState(false)

    const handleDelete = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this video?')) {
            await deleteVideo(video.id)
        }
        setShowMenu(false)
    }

    const formatDuration = (seconds) => {
        if (!seconds) return ''
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-100 text-green-700',
            processing: 'bg-yellow-100 text-yellow-700',
            pending: 'bg-gray-100 text-gray-600',
            failed: 'bg-red-100 text-red-700',
        }
        return styles[status] || styles.pending
    }

    if (variant === 'list') {
        return (
            <Link
                to={`/player/${video.id}`}
                className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
                {/* Thumbnail */}
                <div className="w-32 h-20 lg:w-40 lg:h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                    {video.thumbnail_url ? (
                        <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400 text-3xl">smart_display</span>
                        </div>
                    )}
                    {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatDuration(video.duration)}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center gap-1">
                    <h3 className="font-semibold text-[#0d141b] line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-500">
                        {video.source_type === 'youtube' ? 'YouTube' : 'Upload'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(video.status)}`}>
                            {video.status}
                        </span>
                        {video.status === 'processing' && (
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${video.progress || 0}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        )
    }

    // Grid variant (default)
    return (
        <Link
            to={`/player/${video.id}`}
            className="flex flex-col gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
            {/* Thumbnail */}
            <div className="w-full aspect-video rounded-lg bg-gray-200 overflow-hidden relative group-hover:shadow-glow transition-all duration-300">
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-300 text-4xl group-hover:text-primary/50 transition-colors">smart_display</span>
                    </div>
                )}

                {/* Duration badge */}
                {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded border border-white/10">
                        {formatDuration(video.duration)}
                    </span>
                )}

                {/* Status badge */}
                {video.status !== 'completed' && (
                    <span className={`absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md ${getStatusBadge(video.status)}`}>
                        {video.status}
                    </span>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[1px]">
                    <div className="bg-white/90 rounded-full p-2.5 shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary text-2xl fill-icon">play_arrow</span>
                    </div>
                </div>
            </div>

            {/* Three Dots Menu - Grid */}
            <div className="relative absolute top-3 right-3 z-10">
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowMenu(!showMenu)
                    }}
                    aria-label="Video options menu"
                    aria-expanded={showMenu}
                    aria-haspopup="menu"
                    className="flex items-center justify-center size-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">more_vert</span>
                </button>

                {showMenu && (
                    <div
                        role="menu"
                        aria-label="Video actions"
                        className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in"
                    >
                        <button
                            role="menuitem"
                            onClick={handleDelete}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left focus:outline-none focus:bg-red-50"
                        >
                            <span className="material-symbols-outlined text-lg" aria-hidden="true">delete</span>
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 px-1">
                <h3 className="font-semibold text-[#0d141b] line-clamp-2 text-sm group-hover:text-primary transition-colors">{video.title}</h3>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium tracking-wide">
                        {video.source_type === 'youtube' ? 'YouTube' : 'Uploaded'}
                    </p>
                    {video.status === 'processing' && (
                        <div className="flex items-center gap-2 min-w-[30%]">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${video.progress || 0}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">{video.progress || 0}%</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

VideoCard.propTypes = {
    video: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        thumbnail_url: PropTypes.string,
        duration: PropTypes.number,
        status: PropTypes.oneOf(['pending', 'processing', 'completed', 'failed']),
        progress: PropTypes.number,
        source_type: PropTypes.string,
    }).isRequired,
    variant: PropTypes.oneOf(['grid', 'list']),
}

