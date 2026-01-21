import { createContext, useContext, useReducer, useCallback } from 'react'
import { quizAPI } from '../services/api'

// Initial state
const initialState = {
    quiz: null,
    currentQuestionIndex: 0,
    answers: {}, // { questionId: selectedOptionId }
    results: null,
    loading: false,
    error: null,
}

// Action types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_QUIZ: 'SET_QUIZ',
    SET_ANSWER: 'SET_ANSWER',
    SET_QUESTION_INDEX: 'SET_QUESTION_INDEX',
    SET_RESULTS: 'SET_RESULTS',
    RESET_QUIZ: 'RESET_QUIZ',
}

// Reducer
function quizReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload }

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false }

        case ACTIONS.SET_QUIZ:
            return {
                ...state,
                quiz: action.payload,
                currentQuestionIndex: 0,
                answers: {},
                results: null,
                loading: false,
            }

        case ACTIONS.SET_ANSWER:
            return {
                ...state,
                answers: {
                    ...state.answers,
                    [action.payload.questionId]: action.payload.optionId
                }
            }

        case ACTIONS.SET_QUESTION_INDEX:
            return { ...state, currentQuestionIndex: action.payload }

        case ACTIONS.SET_RESULTS:
            return { ...state, results: action.payload, loading: false }

        case ACTIONS.RESET_QUIZ:
            return { ...initialState }

        default:
            return state
    }
}

// Create Context
const QuizContext = createContext(null)

// Provider Component
export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, initialState)

    // Generate quiz for a video
    const generateQuiz = useCallback(async (videoId, questionCount = 10) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const quiz = await quizAPI.generate(videoId, questionCount)
            dispatch({ type: ACTIONS.SET_QUIZ, payload: quiz })
            return quiz
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [])

    // Load existing quiz
    const loadQuiz = useCallback(async (quizId) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const quiz = await quizAPI.getById(quizId)
            dispatch({ type: ACTIONS.SET_QUIZ, payload: quiz })
            return quiz
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [])

    // Set answer for a question
    const setAnswer = useCallback((questionId, optionId) => {
        dispatch({
            type: ACTIONS.SET_ANSWER,
            payload: { questionId, optionId }
        })
    }, [])

    // Navigate to question
    const goToQuestion = useCallback((index) => {
        if (state.quiz && index >= 0 && index < state.quiz.questions.length) {
            dispatch({ type: ACTIONS.SET_QUESTION_INDEX, payload: index })
        }
    }, [state.quiz])

    // Go to next question
    const nextQuestion = useCallback(() => {
        goToQuestion(state.currentQuestionIndex + 1)
    }, [state.currentQuestionIndex, goToQuestion])

    // Go to previous question
    const prevQuestion = useCallback(() => {
        goToQuestion(state.currentQuestionIndex - 1)
    }, [state.currentQuestionIndex, goToQuestion])

    // Submit quiz
    const submitQuiz = useCallback(async () => {
        if (!state.quiz) return

        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const results = await quizAPI.submit(state.quiz.id, state.answers)
            dispatch({ type: ACTIONS.SET_RESULTS, payload: results })
            return results
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [state.quiz, state.answers])

    // Reset quiz
    const resetQuiz = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_QUIZ })
    }, [])

    // Computed values
    const currentQuestion = state.quiz?.questions?.[state.currentQuestionIndex] || null
    const totalQuestions = state.quiz?.questions?.length || 0
    const answeredCount = Object.keys(state.answers).length
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

    const value = {
        ...state,
        currentQuestion,
        totalQuestions,
        answeredCount,
        progress,
        generateQuiz,
        loadQuiz,
        setAnswer,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        submitQuiz,
        resetQuiz,
    }

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    )
}

// Custom hook
export function useQuiz() {
    const context = useContext(QuizContext)
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider')
    }
    return context
}
