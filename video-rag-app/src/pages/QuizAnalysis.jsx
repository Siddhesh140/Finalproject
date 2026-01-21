import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuiz, useVideos } from '../context'
import { Header, PageLoader, ErrorMessage } from '../components'

export default function QuizAnalysis() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const quizId = searchParams.get('quizId')

    const { results, loading, error } = useQuiz()
    const { videos } = useVideos()

    const [videoTitle, setVideoTitle] = useState('')

    useEffect(() => {
        // Get video title for context
        if (results?.quiz_id) {
            const quiz = results
            const video = videos.find(v => v.id === quiz.video_id)
            if (video) setVideoTitle(video.title)
        }
    }, [results, videos])

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
                <Header title="Quiz Analysis" showBack onBack={() => navigate(-1)} />
                <PageLoader text="Loading results..." />
            </div>
        )
    }

    if (error || !results) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
                <Header title="Quiz Analysis" showBack onBack={() => navigate(-1)} />
                <ErrorMessage
                    message={error || "No quiz results found"}
                    onRetry={() => navigate('/library')}
                />
            </div>
        )
    }

    const { score, total, percentage, analysis, knowledge_gaps } = results

    const getScoreColor = () => {
        if (percentage >= 80) return 'text-green-600'
        if (percentage >= 60) return 'text-yellow-600'
        return 'text-red-500'
    }

    const getScoreBg = () => {
        if (percentage >= 80) return 'from-green-500 to-emerald-500'
        if (percentage >= 60) return 'from-yellow-500 to-orange-500'
        return 'from-red-500 to-pink-500'
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/library')}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined dark:text-white">arrow_back</span>
                        </button>
                        <h1 className="text-lg lg:text-xl font-bold leading-tight tracking-tight dark:text-white">Quiz Analysis</h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium">Home</Link>
                        <Link to="/library" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium">Library</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">download</span>
                            <span className="hidden lg:inline text-sm font-medium dark:text-white">Export</span>
                        </button>
                        <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined dark:text-white">share</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-10 pb-32 lg:pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Performance Summary Card */}
                        <section>
                            <h2 className="text-[#0d141b] dark:text-white tracking-tight text-2xl lg:text-3xl font-bold leading-tight mb-6">
                                Performance Summary
                            </h2>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    {/* Circular Score */}
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
                                                className={`w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br ${getScoreBg()} p-2`}
                                            >
                                                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                                                    <span className={`text-4xl lg:text-5xl font-bold ${getScoreColor()}`}>
                                                        {percentage}%
                                                    </span>
                                                    <span className="text-gray-500 text-sm">{score}/{total}</span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex flex-col items-center gap-2 p-4 lg:p-6 rounded-xl bg-green-50 border border-green-100"
                                        >
                                            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                                            <span className="text-xs font-medium text-slate-500">Correct</span>
                                            <span className="text-2xl font-bold text-green-600">{score}</span>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex flex-col items-center gap-2 p-4 lg:p-6 rounded-xl bg-red-50 border border-red-100"
                                        >
                                            <span className="material-symbols-outlined text-red-500 text-2xl">cancel</span>
                                            <span className="text-xs font-medium text-slate-500">Incorrect</span>
                                            <span className="text-2xl font-bold text-red-500">{total - score}</span>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex flex-col items-center gap-2 p-4 lg:p-6 rounded-xl bg-blue-50 border border-blue-100"
                                        >
                                            <span className="material-symbols-outlined text-blue-500 text-2xl">help</span>
                                            <span className="text-xs font-medium text-slate-500">Total</span>
                                            <span className="text-2xl font-bold text-blue-500">{total}</span>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* AI-Generated Review Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                                <h2 className="text-xl lg:text-2xl font-bold tracking-tight">AI-Generated Review</h2>
                            </div>
                            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200">
                                {analysis ? (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis}</p>
                                ) : (
                                    <p className="text-gray-500 italic">No AI analysis available for this quiz.</p>
                                )}

                                <div className="pt-4 border-t border-slate-100 mt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary">smart_toy</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">AI Tutor</p>
                                            <p className="text-gray-500 text-xs">Personalized feedback based on your performance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Knowledge Gaps */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-orange-500">warning</span>
                                <h2 className="text-xl font-bold tracking-tight">Areas to Review</h2>
                            </div>

                            {knowledge_gaps && knowledge_gaps.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                    {knowledge_gaps.map((gap, index) => (
                                        <div key={index} className="px-3 py-2 bg-orange-50 rounded-lg text-sm text-orange-800 border border-orange-100">
                                            {gap}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mb-4">
                                    {percentage >= 80
                                        ? "Great job! You've mastered this content."
                                        : "Review the video to improve your understanding."}
                                </p>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h3 className="font-semibold mb-3">Next Steps</h3>
                                <div className="space-y-2">
                                    <Link to="/library" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className="material-symbols-outlined text-primary">play_circle</span>
                                        <span className="text-sm">Review video content</span>
                                    </Link>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors w-full"
                                    >
                                        <span className="material-symbols-outlined text-primary">refresh</span>
                                        <span className="text-sm">Retake quiz</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Action */}
            <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4">
                <div className="flex flex-col gap-3">
                    <Link
                        to="/library"
                        className="w-full h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">play_circle</span>
                        Continue Learning
                    </Link>
                </div>
            </footer>
        </div>
    )
}
