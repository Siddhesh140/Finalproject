export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Something went wrong</h3>
                <p className="text-gray-500 text-sm max-w-md">{message || 'An unexpected error occurred'}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Try Again
                </button>
            )}
        </div>
    )
}

export function EmptyState({ icon = 'inbox', title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
            <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400 text-4xl">{icon}</span>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{title || 'No items found'}</h3>
                {message && <p className="text-gray-500 text-sm max-w-md">{message}</p>}
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    {action.icon && <span className="material-symbols-outlined text-lg">{action.icon}</span>}
                    {action.label}
                </button>
            )}
        </div>
    )
}
