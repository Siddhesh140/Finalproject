import { NavLink } from 'react-router-dom'

export default function BottomNavDashboard() {
    const navItems = [
        { icon: 'home', label: 'Home', path: '/dashboard', filled: true },
        { icon: 'video_library', label: 'Library', path: '/library' },
        { icon: 'search', label: 'Search', path: '/search' },
        { icon: 'settings', label: 'Settings', path: '#' },
    ]

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 pt-3 pb-8 flex justify-between items-center z-10">
            {navItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-400'
                        }`
                    }
                >
                    <span
                        className="material-symbols-outlined"
                        style={item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        {item.icon}
                    </span>
                    <span className={`text-[10px] ${item.filled ? 'font-bold' : 'font-medium'}`}>
                        {item.label}
                    </span>
                </NavLink>
            ))}
        </div>
    )
}
