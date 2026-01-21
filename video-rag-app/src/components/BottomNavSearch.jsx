import { NavLink } from 'react-router-dom'

export default function BottomNavSearch() {
    const navItems = [
        { icon: 'home', label: 'Home', path: '/dashboard' },
        { icon: 'search', label: 'Search', path: '/search' },
        { icon: 'video_library', label: 'Library', path: '/library' },
        { icon: 'person', label: 'Profile', path: '#' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-gray-200 flex items-center justify-around px-6 pb-4">
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
                        style={item.path === '/search' ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        {item.icon}
                    </span>
                    <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
            ))}
        </div>
    )
}
