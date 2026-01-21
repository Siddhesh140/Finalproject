import { createContext, useContext, useReducer, useCallback } from 'react'
import { chatAPI } from '../services/api'

// Initial state
const initialState = {
    messages: [], // Current chat messages
    videoId: null,
    loading: false,
    error: null,
}

// Action types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_MESSAGES: 'SET_MESSAGES',
    ADD_MESSAGE: 'ADD_MESSAGE',
    SET_VIDEO_ID: 'SET_VIDEO_ID',
    CLEAR_CHAT: 'CLEAR_CHAT',
}

// Reducer
function chatReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload }

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false }

        case ACTIONS.SET_MESSAGES:
            return { ...state, messages: action.payload, loading: false }

        case ACTIONS.ADD_MESSAGE:
            return { ...state, messages: [...state.messages, action.payload] }

        case ACTIONS.SET_VIDEO_ID:
            return { ...state, videoId: action.payload, messages: [] }

        case ACTIONS.CLEAR_CHAT:
            return { ...state, messages: [] }

        default:
            return state
    }
}

// Create Context
const ChatContext = createContext(null)

// Provider Component
export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState)

    // Initialize chat for a video
    const initChat = useCallback(async (videoId) => {
        dispatch({ type: ACTIONS.SET_VIDEO_ID, payload: videoId })
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const history = await chatAPI.getHistory(videoId)
            dispatch({ type: ACTIONS.SET_MESSAGES, payload: history.messages || [] })
        } catch (error) {
            // If no history exists, that's okay
            dispatch({ type: ACTIONS.SET_MESSAGES, payload: [] })
        }
    }, [])

    // Send a message
    const sendMessage = useCallback(async (message) => {
        if (!state.videoId) return

        // Add user message immediately
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        }
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: userMessage })
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })

        try {
            const response = await chatAPI.sendMessage(state.videoId, message)

            // Add AI response
            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.message,
                timestamp: new Date().toISOString(),
                references: response.references, // Video timestamp references
            }
            dispatch({ type: ACTIONS.ADD_MESSAGE, payload: aiMessage })
            dispatch({ type: ACTIONS.SET_LOADING, payload: false })

            return response
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [state.videoId])

    // Clear chat
    const clearChat = useCallback(async () => {
        if (state.videoId) {
            try {
                await chatAPI.clearHistory(state.videoId)
            } catch (error) {
                console.error('Error clearing chat:', error)
            }
        }
        dispatch({ type: ACTIONS.CLEAR_CHAT })
    }, [state.videoId])

    const value = {
        ...state,
        initChat,
        sendMessage,
        clearChat,
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

// Custom hook
export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}
