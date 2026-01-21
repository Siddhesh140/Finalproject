import { createContext, useContext, useReducer, useCallback } from 'react'
import { videoAPI } from '../services/api'

// Initial state
const initialState = {
    videos: [],
    currentVideo: null,
    loading: false,
    error: null,
    processingVideos: [], // Videos currently being processed
}

// Action types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_VIDEOS: 'SET_VIDEOS',
    ADD_VIDEO: 'ADD_VIDEO',
    UPDATE_VIDEO: 'UPDATE_VIDEO',
    DELETE_VIDEO: 'DELETE_VIDEO',
    SET_CURRENT_VIDEO: 'SET_CURRENT_VIDEO',
    ADD_PROCESSING: 'ADD_PROCESSING',
    REMOVE_PROCESSING: 'REMOVE_PROCESSING',
}

// Reducer
function videoReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload }

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false }

        case ACTIONS.SET_VIDEOS:
            return { ...state, videos: action.payload, loading: false }

        case ACTIONS.ADD_VIDEO:
            return { ...state, videos: [action.payload, ...state.videos] }

        case ACTIONS.UPDATE_VIDEO:
            return {
                ...state,
                videos: state.videos.map(v =>
                    v.id === action.payload.id ? { ...v, ...action.payload } : v
                ),
            }

        case ACTIONS.DELETE_VIDEO:
            return {
                ...state,
                videos: state.videos.filter(v => v.id !== action.payload),
            }

        case ACTIONS.SET_CURRENT_VIDEO:
            return { ...state, currentVideo: action.payload }

        case ACTIONS.ADD_PROCESSING:
            return {
                ...state,
                processingVideos: [...state.processingVideos, action.payload]
            }

        case ACTIONS.REMOVE_PROCESSING:
            return {
                ...state,
                processingVideos: state.processingVideos.filter(id => id !== action.payload)
            }

        default:
            return state
    }
}

// Create Context
const VideoContext = createContext(null)

// Provider Component
export function VideoProvider({ children }) {
    const [state, dispatch] = useReducer(videoReducer, initialState)

    // Fetch all videos
    const fetchVideos = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const videos = await videoAPI.getAll()
            dispatch({ type: ACTIONS.SET_VIDEOS, payload: videos })
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
        }
    }, [])

    // Process video from URL
    const processVideoUrl = useCallback(async (url, title) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const video = await videoAPI.processUrl(url, title)
            dispatch({ type: ACTIONS.ADD_VIDEO, payload: video })
            dispatch({ type: ACTIONS.ADD_PROCESSING, payload: video.id })
            return video
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [])

    // Upload video file
    const uploadVideo = useCallback(async (file, title) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const video = await videoAPI.upload(file, title)
            dispatch({ type: ACTIONS.ADD_VIDEO, payload: video })
            dispatch({ type: ACTIONS.ADD_PROCESSING, payload: video.id })
            return video
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [])

    // Delete video
    const deleteVideo = useCallback(async (id) => {
        try {
            await videoAPI.delete(id)
            dispatch({ type: ACTIONS.DELETE_VIDEO, payload: id })
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [])

    // Set current video for player
    const setCurrentVideo = useCallback((video) => {
        dispatch({ type: ACTIONS.SET_CURRENT_VIDEO, payload: video })
    }, [])

    // Check video processing status
    const checkProcessingStatus = useCallback(async (id) => {
        try {
            const status = await videoAPI.getStatus(id)
            if (status.status === 'completed') {
                dispatch({ type: ACTIONS.REMOVE_PROCESSING, payload: id })
                dispatch({ type: ACTIONS.UPDATE_VIDEO, payload: { id, ...status } })
            }
            return status
        } catch (error) {
            console.error('Error checking status:', error)
        }
    }, [])

    const value = {
        ...state,
        fetchVideos,
        processVideoUrl,
        uploadVideo,
        deleteVideo,
        setCurrentVideo,
        checkProcessingStatus,
    }

    return (
        <VideoContext.Provider value={value}>
            {children}
        </VideoContext.Provider>
    )
}

// Custom hook to use context
export function useVideos() {
    const context = useContext(VideoContext)
    if (!context) {
        throw new Error('useVideos must be used within a VideoProvider')
    }
    return context
}
