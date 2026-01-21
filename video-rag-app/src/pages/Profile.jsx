import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useVideos, useTheme } from '../context'
import { Header } from '../components'

export default function Profile() {
    const navigate = useNavigate()
    const { videos } = useVideos()
    const { isDarkMode, toggleDarkMode } = useTheme()

    // Mock user data (replace with real auth later)
    const [user] = useState({
        name: 'User',
        email: 'user@example.com',
        avatar: null,
        joinedDate: 'January 2026'
    })

    const stats = {
        videosProcessed: videos.length,
        quizzesTaken: 0,
        notesCreated: 0
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
            <Header
                title="Profile"
                icon={{ name: 'person', bg: 'bg-primary' }}
                showBack
                onBack={() => navigate(-1)}
            />

            <main className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-24">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 mb-6"
                >
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="size-20 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                            <p className="text-sm text-gray-400 mt-1">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">calendar_month</span>
                                Joined {user.joinedDate}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-6"
                >
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-primary">{stats.videosProcessed}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Videos</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-500">{stats.quizzesTaken}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quizzes</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-500">{stats.notesCreated}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Notes</div>
                    </div>
                </motion.div>

                {/* Settings Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl overflow-hidden"
                >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-100 dark:border-slate-700">
                        Settings
                    </h2>

                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">notifications</span>
                                <span className="text-gray-700 dark:text-gray-200">Notifications</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>

                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                                <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
                                <div className={`size-4 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">help</span>
                                <span className="text-gray-700 dark:text-gray-200">Help & Support</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">info</span>
                                <span className="text-gray-700 dark:text-gray-200">About</span>
                            </div>
                            <span className="text-sm text-gray-400">v1.0.0</span>
                        </button>
                    </div>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full mt-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <span className="material-symbols-outlined align-middle mr-2">logout</span>
                    Log Out
                </motion.button>
            </main>
        </div>
    )
}

