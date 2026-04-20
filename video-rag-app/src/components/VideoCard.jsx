import { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useVideos } from '../context'
import ConfirmModal from './ConfirmModal'

export default function VideoCard({ video, variant = 'grid' }) {
    const { deleteVideo } = useVideos()
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setShowDeleteModal(true)
        setShowMenu(false)
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteVideo(video.id)
        } catch (error) {
            console.error('Failed to delete video:', error)
            setIsDeleting(false)
        }
    }

    const formatDuration = (seconds) => {
        if (!seconds) return ''
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-secondary/10 text-secondary border border-secondary/20 shadow-[0_0_10px_rgba(23,222,202,0.2)]',
            processing: 'bg-tertiary/10 text-tertiary border border-tertiary/20 animate-pulse shadow-[0_0_10px_rgba(255,197,99,0.2)]',
            pending: 'bg-outline-variant-light dark:bg-white/5 text-on-surface-variant-light dark:text-on-surface-variant-dark border border-outline-light dark:border-white/10',
            failed: 'bg-error-container text-error border border-error/20',
        }
        return styles[status] || styles.pending
    }

    if (variant === 'list') {
        return (
            <Link
                to={`/player/${video.id}`}
                className="flex gap-4 p-3 glass-card glass-card-hover rounded-xl cursor-pointer"
            >
                {/* Thumbnail */}
                <div className="w-32 h-20 lg:w-40 lg:h-24 rounded-lg bg-surface-variant-light dark:bg-[#0A0E1A] border border-outline-variant-light dark:border-white/5 overflow-hidden flex-shrink-0 relative">
                    {video.thumbnail_url ? (
                        <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline-light dark:text-outline-dark text-3xl">smart_display</span>
                        </div>
                    )}
                    {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-md text-white text-xs px-1.5 py-0.5 rounded font-body">
                            {formatDuration(video.duration)}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0 overflow-hidden">
                    <h3 className="font-semibold text-on-surface-light dark:text-white truncate" title={video.title}>{video.title}</h3>
                    <p className="text-xs text-on-surface-variant-light dark:text-on-surface-variant-dark font-body uppercase tracking-wider">
                        {video.source_type === 'youtube' ? 'YouTube' : 'Upload'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getStatusBadge(video.status)}`}>
                            {video.status}
                        </span>
                        {video.status === 'processing' && (
                            <div className="flex-1 max-w-[100px] h-1.5 bg-background-light dark:bg-black/50 rounded-full overflow-hidden ml-2 border border-outline-variant-light dark:border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
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
            className="group relative flex flex-col gap-3 glass-card glass-card-hover p-3 cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="w-full aspect-video rounded-lg bg-surface-variant-light dark:bg-[#0A0E1A] overflow-hidden relative transition-all duration-300">
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-light dark:text-outline-dark text-4xl group-hover:text-primary transition-colors">smart_display</span>
                    </div>
                )}

                {/* Duration badge */}
                {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white font-body text-[10px] font-medium px-1.5 py-0.5 rounded border border-white/10">
                        {formatDuration(video.duration)}
                    </span>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[2px]">
                    <div className="bg-white rounded-full p-2.5 shadow-cosmic transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary text-2xl fill-icon">play_arrow</span>
                    </div>
                </div>
            </div>

            {/* Status badge - Floating top left */}
            {video.status !== 'completed' && (
                <span className={`absolute top-5 left-5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full z-10 ${getStatusBadge(video.status)}`}>
                    {video.status}
                </span>
            )}

            {/* Three Dots Menu - Grid */}
            <div className="absolute top-5 right-5 z-20">
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowMenu(!showMenu)
                    }}
                    className="flex items-center justify-center size-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 transition-colors focus:outline-none"
                >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">more_vert</span>
                </button>

                {showMenu && (
                    <div
                        className="absolute right-0 top-full mt-2 w-32 bg-surface-container-highest-light dark:bg-surface-container-highest-dark rounded-lg shadow-xl border border-outline-variant-light dark:border-white/10 overflow-hidden z-30 animate-fade-in"
                    >
                        <button
                            onClick={handleDeleteClick}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors font-semibold"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 px-1">
                <h3 className="font-bold text-on-surface-light dark:text-white line-clamp-2 text-sm group-hover:text-primary transition-colors">{video.title}</h3>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-on-surface-variant-light dark:text-outline-dark font-body uppercase tracking-wider font-semibold">
                        {video.source_type === 'youtube' ? 'YouTube' : 'Uploaded'}
                    </p>
                    {video.status === 'processing' && (
                        <div className="flex items-center gap-2 min-w-[30%]">
                            <div className="flex-1 h-1.5 bg-background-light dark:bg-black/50 rounded-full overflow-hidden border border-outline-variant-light dark:border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                    style={{ width: `${video.progress || 0}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-body text-primary-dim font-bold">{video.progress || 0}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Video"
                message={`Are you sure you want to delete "${video.title}"? This action cannot be undone.`}
                confirmText="Delete Video"
                isDanger={true}
                isLoading={isDeleting}
            />
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
