import { Link } from 'react-router-dom'

export default function VideoCard({ video, variant = 'grid' }) {
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
                    </div>
                </div>
            </Link>
        )
    }

    // Grid variant (default)
    return (
        <Link
            to={`/player/${video.id}`}
            className="flex flex-col gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
        >
            {/* Thumbnail */}
            <div className="w-full aspect-video rounded-lg bg-gray-200 overflow-hidden relative">
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400 text-4xl">smart_display</span>
                    </div>
                )}

                {/* Duration badge */}
                {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                    </span>
                )}

                {/* Status badge */}
                {video.status !== 'completed' && (
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${getStatusBadge(video.status)}`}>
                        {video.status}
                    </span>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                        <span className="material-symbols-outlined text-primary text-2xl">play_arrow</span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 px-1">
                <h3 className="font-medium text-[#0d141b] line-clamp-2 text-sm">{video.title}</h3>
                <p className="text-xs text-gray-500">
                    {video.source_type === 'youtube' ? 'YouTube' : 'Uploaded'}
                </p>
            </div>
        </Link>
    )
}
