import { Link, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTheme } from '../context'

export default function Header({ title, icon, showBack = false, onBack }) {
    const location = useLocation()
    const { isDarkMode, toggleDarkMode } = useTheme()

    const navItems = [
        { path: '/dashboard', label: 'Home' },
        { path: '/library', label: 'Library' },
        { path: '/search', label: 'Search' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <header className="sticky top-0 z-20 glass border-none">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBack && onBack && (
                        <button
                            onClick={onBack}
                            aria-label="Go back"
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <span className="material-symbols-outlined dark:text-white" aria-hidden="true">arrow_back</span>
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
                        <h1 className="text-[#0d141b] dark:text-white text-xl lg:text-2xl font-bold tracking-tight">
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
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>



                    {/* App Logo */}
                    <div className="hidden md:flex items-center justify-center size-10 rounded-xl bg-primary/10 dark:bg-primary/20">
                        <span className="material-symbols-outlined text-primary text-xl">smart_display</span>
                    </div>

                    {/* Profile */}
                    <Link
                        to="/profile"
                        className="size-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold hover:scale-105 hover:shadow-lg transition-all"
                        aria-label="Go to profile"
                    >
                        U
                    </Link>
                </div>
            </div>
        </header>
    )
}

Header.propTypes = {
    title: PropTypes.string,
    icon: PropTypes.shape({
        name: PropTypes.string.isRequired,
        bg: PropTypes.string,
        color: PropTypes.string,
    }),
    showBack: PropTypes.bool,
    onBack: PropTypes.func,
}


