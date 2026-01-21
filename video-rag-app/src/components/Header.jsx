import { Link, useLocation } from 'react-router-dom'

export default function Header({ title, icon, showBack = false, onBack }) {
    const location = useLocation()

    const navItems = [
        { path: '/dashboard', label: 'Home' },
        { path: '/library', label: 'Library' },
        { path: '/search', label: 'Search' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBack && onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}

                    {icon && (
                        <div className={`${icon.bg || 'bg-primary'} p-2 rounded-xl flex items-center justify-center`}>
                            <span className={`material-symbols-outlined ${icon.color || 'text-white'} text-2xl`}>
                                {icon.name}
                            </span>
                        </div>
                    )}

                    {title && (
                        <h1 className="text-[#0d141b] text-xl lg:text-2xl font-bold tracking-tight">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`font-medium transition-colors ${isActive(item.path)
                                    ? 'text-primary font-semibold'
                                    : 'text-gray-500 hover:text-primary'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-gray-600">notifications</span>
                    </button>
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold">
                        U
                    </div>
                </div>
            </div>
        </header>
    )
}
