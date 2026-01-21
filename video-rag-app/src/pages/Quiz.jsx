import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuiz, useVideos } from '../context'
import { Header, PageLoader, ErrorMessage } from '../components'

export default function Quiz() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const videoId = searchParams.get('videoId')

    const { videos, fetchVideos } = useVideos()
    const {
        quiz,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        answers,
        loading,
        error,
        progress,
        generateQuiz,
        setAnswer,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        submitQuiz,
    } = useQuiz()

    const [submitting, setSubmitting] = useState(false)
    const [generating, setGenerating] = useState(false)

    // Generate quiz on mount if we have a videoId
    useEffect(() => {
        const init = async () => {
            if (videoId && !quiz) {
                setGenerating(true)
                try {
                    // Make sure we have video data
                    if (videos.length === 0) {
                        await fetchVideos()
                    }
                    await generateQuiz(videoId, 10)
                } catch (err) {
                    console.error('Failed to generate quiz:', err)
                } finally {
                    setGenerating(false)
                }
            }
        }
        init()
    }, [videoId])

    const handleAnswerSelect = (optionId) => {
        if (!currentQuestion) return
        setAnswer(currentQuestion.id, optionId)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const results = await submitQuiz()
            navigate(`/quiz-analysis?quizId=${quiz.id}`)
        } catch (err) {
            console.error('Failed to submit quiz:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null
    const answeredCount = Object.keys(answers).length
    const canSubmit = answeredCount === totalQuestions

    if (generating || loading) {
        return (
            <div className="min-h-screen bg-background-light">
                <Header title="Quiz" showBack onBack={() => navigate(-1)} />
                <PageLoader text="Generating quiz questions..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-light">
                <Header title="Quiz" showBack onBack={() => navigate(-1)} />
                <ErrorMessage message={error} onRetry={() => generateQuiz(videoId, 10)} />
            </div>
        )
    }

    if (!quiz || !currentQuestion) {
        return (
            <div className="min-h-screen bg-background-light">
                <Header title="Quiz" showBack onBack={() => navigate(-1)} />
                <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">quiz</span>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">No Quiz Available</h2>
                    <p className="text-gray-500 mb-6">Select a video to generate a quiz</p>
                    <Link
                        to="/library"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium"
                    >
                        <span className="material-symbols-outlined">video_library</span>
                        Go to Library
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background-light">
            {/* Top Navigation */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-[#0d141b] text-xl lg:text-2xl font-bold tracking-[-0.015em]">
                            Video Quiz
                        </h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className="text-gray-500 hover:text-primary transition-colors font-medium">Home</Link>
                        <Link to="/library" className="text-gray-500 hover:text-primary transition-colors font-medium">Library</Link>
                    </nav>

                    <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-10 pb-32 lg:pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quiz Content */}
                    <div className="lg:col-span-2">
                        {/* Progress Bar */}
                        <div className="flex flex-col gap-3 mb-8">
                            <div className="flex gap-6 justify-between items-end">
                                <p className="text-lg font-semibold">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </p>
                                <p className="text-sm text-gray-500">{answeredCount} answered</p>
                            </div>
                            <div className="rounded-full bg-[#cfdbe7] h-3 overflow-hidden">
                                <div
                                    className="h-3 rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="relative min-h-[400px]">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 mb-6"
                                >
                                    {/* Question */}
                                    <h2 className="text-xl lg:text-2xl font-semibold text-[#0d141b] mb-6">
                                        {currentQuestion.question}
                                    </h2>

                                    {/* Answer Options */}
                                    <div className="flex flex-col gap-4">
                                        {currentQuestion.options.map((option, index) => (
                                            <motion.button
                                                key={option.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => handleAnswerSelect(option.id)}
                                                className={`flex items-center gap-4 rounded-xl border-2 p-4 lg:p-5 transition-all text-left group ${currentAnswer === option.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-[#cfdbe7] bg-white hover:border-primary/50 hover:bg-primary/5'
                                                    }`}
                                            >
                                                <div
                                                    className={`h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${currentAnswer === option.id
                                                        ? 'border-primary bg-primary'
                                                        : 'border-[#cfdbe7] group-hover:border-primary/50'
                                                        }`}
                                                >
                                                    {currentAnswer === option.id && (
                                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                                    )}
                                                </div>
                                                <span className="text-[#0d141b]">{option.text}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons - Desktop */}
                        <div className="hidden lg:flex items-center justify-between">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Previous
                            </button>

                            {currentQuestionIndex === totalQuestions - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                    <span className="material-symbols-outlined">check_circle</span>
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Next Question
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Question Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-[#0d141b] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
                                Question Navigation
                            </h3>

                            <div className="grid grid-cols-5 gap-3">
                                {Array.from({ length: totalQuestions }, (_, i) => i).map((index) => {
                                    const questionId = quiz.questions[index]?.id
                                    const isAnswered = questionId && answers[questionId]
                                    const isCurrent = index === currentQuestionIndex

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => goToQuestion(index)}
                                            className={`size-12 shrink-0 rounded-xl flex items-center justify-center font-medium transition-all hover:scale-105 ${isCurrent
                                                ? 'border-2 border-primary bg-primary/10 text-primary font-bold'
                                                : isAnswered
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'border border-slate-200 text-slate-400 hover:border-primary/50'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                    <span>Progress</span>
                                    <span>{answeredCount}/{totalQuestions} answered</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-2 bg-green-500 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit || submitting}
                                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-xl">flag</span>
                                {canSubmit ? 'Finish Quiz' : `Answer ${totalQuestions - answeredCount} more`}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Action */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200">
                {currentQuestionIndex === totalQuestions - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        className="w-full h-14 rounded-xl bg-green-600 text-white font-bold shadow-lg disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        onClick={nextQuestion}
                        className="w-full h-14 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                    >
                        Next Question
                    </button>
                )}
            </div>
        </div>
    )
}
