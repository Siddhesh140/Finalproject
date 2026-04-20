export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 glass-card rounded-2xl border-error/20">
            <div className="size-16 rounded-full bg-error-container text-error flex items-center justify-center shadow-[0_0_20px_rgba(253,111,133,0.3)] animate-pulse">
                <span className="material-symbols-outlined text-3xl font-variation-fill">error</span>
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-on-surface-light dark:text-white mb-2">Houston, we have a problem!</h3>
                <p className="text-on-surface-variant-light dark:text-on-surface-variant-dark text-sm max-w-md font-body">{message || 'An unexpected error occurred in the cosmos'}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-5 py-2.5 mt-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all font-bold border border-error/20 hover:border-error/40 hover:shadow-[0_0_15px_rgba(253,111,133,0.2)]"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Try Again
                </button>
            )}
        </div>
    )
}

export function EmptyState({ icon = 'rocket_launch', title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center gap-5 py-16 px-4 glass-card rounded-2xl w-full max-w-2xl mx-auto">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <div className="size-20 relative rounded-full bg-surface-variant-light dark:bg-surface-container-highest-dark border border-outline-variant-light dark:border-white/10 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-primary dark:text-primary-light text-4xl">{icon}</span>
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-on-surface-light dark:text-white mb-2">{title || 'No items found'}</h3>
                {message && <p className="text-on-surface-variant-light dark:text-on-surface-variant-dark text-sm max-w-md mx-auto font-body tracking-wide">{message}</p>}
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-2 btn-primary shadow-cosmic"
                >
                    {action.icon && <span className="material-symbols-outlined text-lg">{action.icon}</span>}
                    {action.label}
                </button>
            )}
        </div>
    )
}
