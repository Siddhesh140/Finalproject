import { NavLink } from 'react-router-dom'

export default function BottomNavLibrary() {
    const navItems = [
        { icon: 'video_library', label: 'Library', path: '/library' },
        { icon: 'search', label: 'Search', path: '/search' },
        { icon: 'smart_toy', label: 'AI Chat', path: '#', isCenter: true },
        { icon: 'person', label: 'Profile', path: '#' },
    ]

    return (
        <nav className="sticky bottom-0 w-full border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pb-6 pt-2">
            <div className="flex gap-2 justify-around items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-1 flex-col items-center justify-center gap-1 ${isActive ? 'text-primary' : 'text-[#4c739a] hover:text-primary'
                            } transition-colors`
                        }
                    >
                        {item.isCenter ? (
                            <>
                                <div className="relative bg-primary rounded-full size-12 -mt-6 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                    <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                                </div>
                                <p className="text-[10px] font-medium leading-normal">{item.label}</p>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined fill-icon text-[28px]">{item.icon}</span>
                                <p className="text-[10px] font-semibold leading-normal">{item.label}</p>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
