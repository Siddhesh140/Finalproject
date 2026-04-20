import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuiz, useVideos } from '../context'

export default function Quiz() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const videoId = searchParams.get('videoId')

    const { videos, fetchVideos, currentVideo, setCurrentVideo } = useVideos()
    const { quiz, currentQuestion, currentQuestionIndex, totalQuestions, answers, loading, error, generateQuiz, submitAnswer, submitQuiz, getResults } = useQuiz()

    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)

    useEffect(() => {
        fetchVideos()
    }, [])

    useEffect(() => {
        if (videoId && videos.length > 0) {
            const video = videos.find(v => v.id === videoId)
            if (video) setCurrentVideo(video)
        }
    }, [videoId, videos])

    const handleGenerateQuiz = async () => {
        if (!videoId) return
        try {
            await generateQuiz(videoId, 5)
        } catch (err) {
            console.error('Failed to generate quiz:', err)
        }
    }

    const handleSelectAnswer = (option) => {
        if (submitted) return
        setSelectedAnswer(option)
    }

    const handleSubmitAnswer = () => {
        if (!selectedAnswer || !quiz) return
        submitAnswer(selectedAnswer)
        setSubmitted(true)
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setSubmitted(false)
            setSelectedAnswer(null)
        } else {
            handleFinishQuiz()
        }
    }

    const handleFinishQuiz = async () => {
        try {
            const res = await getResults()
            setResults(res)
        } catch (err) {
            console.error('Failed to get results:', err)
        }
    }

    if (!videoId) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>quiz</span>
                    <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Select a Video</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Go to a video to generate a quiz</p>
                    <Link to="/library" className="btn btn-primary">Browse Library</Link>
                </div>
            </div>
        )
    }

    if (loading && !quiz) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p>Generating quiz...</p>
                </div>
            </div>
        )
    }

    if (results) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-container" style={{ maxWidth: 600 }}>
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary)' }}>emoji_events</span>
                        <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Quiz Complete!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            You scored {results.correct || 0} out of {results.total || totalQuestions}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to={`/player/${videoId}`} className="btn btn-secondary">Back to Video</Link>
                            <button onClick={() => { setQuiz(null); setResults(null); handleGenerateQuiz(); }} className="btn btn-primary">
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)' }}>quiz</span>
                    <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Ready for a Quiz?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Test your knowledge with questions from "{currentVideo?.title || 'this video'}"
                    </p>
                    <button onClick={handleGenerateQuiz} className="btn btn-primary">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        Generate Quiz
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header style={{ 
                position: 'sticky', 
                top: 0, 
                background: 'var(--surface)', 
                borderBottom: '1px solid var(--border)',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button onClick={() => navigate(-1)} className="btn btn-ghost">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Question</span>
                    <span style={{ fontWeight: 600 }}>{currentQuestionIndex + 1}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>of</span>
                    <span style={{ fontWeight: 600 }}>{totalQuestions}</span>
                </div>
            </header>

            <div className="page-container" style={{ maxWidth: 600 }}>
                {/* Progress */}
                <div style={{ 
                    height: 4, 
                    background: 'var(--border)', 
                    borderRadius: 2, 
                    marginBottom: '2rem',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        height: '100%', 
                        background: 'var(--primary)',
                        width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {/* Question */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 }}>
                        {currentQuestion?.question}
                    </h2>
                </div>

                {/* Options */}
                <div style={{ marginBottom: '1.5rem' }}>
                    {currentQuestion?.options?.map((option, i) => {
                        let className = 'quiz-option'
                        if (submitted) {
                            if (option === currentQuestion.correct_answer) className += ' correct'
                            else if (option === selectedAnswer) className += ' incorrect'
                        } else if (selectedAnswer === option) {
                            className += ' selected'
                        }

                        return (
                            <div 
                                key={i} 
                                className={className}
                                onClick={() => handleSelectAnswer(option)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ 
                                        width: 28, 
                                        height: 28, 
                                        borderRadius: '50%', 
                                        background: selectedAnswer === option ? 'var(--primary)' : 'var(--surface-hover)',
                                        color: selectedAnswer === option ? 'white' : 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span>{option}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Action */}
                {!submitted ? (
                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={handleNext}
                    >
                        {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
                    </button>
                )}
            </div>
        </div>
    )
}