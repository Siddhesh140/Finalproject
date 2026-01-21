export default function LoadingSpinner({ size = 'md', text = '' }) {
    const sizes = {
        sm: 'size-6',
        md: 'size-10',
        lg: 'size-16',
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`}></div>
            {text && <p className="text-gray-500 text-sm">{text}</p>}
        </div>
    )
}

export function PageLoader({ text = 'Loading...' }) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    )
}

export function ButtonLoader() {
    return (
        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
    )
}
