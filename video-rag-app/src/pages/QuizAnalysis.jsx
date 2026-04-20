import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuiz, useVideos } from '../context'

export default function QuizAnalysis() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const quizId = searchParams.get('quizId')

    const { results, loading, error } = useQuiz()
    const { videos } = useVideos()

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (!results) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>assessment</span>
                    <h2 style={{ marginTop: '1rem' }}>No Results</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Complete a quiz to see analysis</p>
                    <Link to="/library" className="btn btn-primary">Go to Library</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            <div className="page-container" style={{ maxWidth: 600 }}>
                <div className="page-header">
                    <h1 className="page-title">Quiz Results</h1>
                </div>

                {/* Score Card */}
                <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        width: 100, 
                        height: 100, 
                        borderRadius: '50%', 
                        background: results.correct >= results.total / 2 ? 'var(--success)' : 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2rem',
                        color: 'white',
                        fontWeight: 700
                    }}>
                        {results.correct}/{results.total}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {results.correct >= results.total / 2 ? 'Great Job!' : 'Keep Practicing!'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {Math.round((results.correct / results.total) * 100)}% correct
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/library" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                        Back to Library
                    </Link>
                    <Link to={`/quiz?videoId=${results.quiz_id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        Try Another Quiz
                    </Link>
                </div>
            </div>
        </div>
    )
}