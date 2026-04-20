import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { videoAPI } from '../services/api'

const initialState = {
    videos: [],
    currentVideo: null,
    loading: false,
    error: null,
    processingVideos: [],
}

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

const VideoContext = createContext(null)

const INITIAL_POLL_INTERVAL = 2000
const MAX_POLL_INTERVAL = 30000
const BACKOFF_MULTIPLIER = 1.5

export function VideoProvider({ children }) {
    const [state, dispatch] = useReducer(videoReducer, initialState)
    const pollIntervalsRef = useRef(new Map())
    const currentIntervalsRef = useRef(new Map())

    const fetchVideos = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const videos = await videoAPI.getAll()
            dispatch({ type: ACTIONS.SET_VIDEOS, payload: videos })
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
        }
    }, [])

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

    const deleteVideo = useCallback(async (id) => {
        try {
            await videoAPI.delete(id)
            dispatch({ type: ACTIONS.DELETE_VIDEO, payload: id })
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
            throw error
        }
    }, [])

    const setCurrentVideo = useCallback((video) => {
        dispatch({ type: ACTIONS.SET_CURRENT_VIDEO, payload: video })
    }, [])

    const checkProcessingStatus = useCallback(async (id) => {
        try {
            const status = await videoAPI.getStatus(id)
            if (status.status === 'completed' || status.status === 'failed') {
                dispatch({ type: ACTIONS.REMOVE_PROCESSING, payload: id })
            }
            dispatch({ type: ACTIONS.UPDATE_VIDEO, payload: { id, ...status } })
            return status
        } catch (error) {
            console.error('Error checking status:', error)
            return null
        }
    }, [])

    useEffect(() => {
        state.processingVideos.forEach(id => {
            if (!currentIntervalsRef.current.has(id)) {
                currentIntervalsRef.current.set(id, INITIAL_POLL_INTERVAL)
                const timeoutId = setTimeout(
                    () => {
                        const checkStatus = async () => {
                            try {
                                const status = await videoAPI.getStatus(id)
                                if (status.status === 'completed' || status.status === 'failed') {
                                    dispatch({ type: ACTIONS.REMOVE_PROCESSING, payload: id })
                                    dispatch({ type: ACTIONS.UPDATE_VIDEO, payload: { id, ...status } })
                                    
                                    if (pollIntervalsRef.current.has(id)) {
                                        clearTimeout(pollIntervalsRef.current.get(id))
                                        pollIntervalsRef.current.delete(id)
                                    }
                                    currentIntervalsRef.current.delete(id)
                                } else {
                                    dispatch({ type: ACTIONS.UPDATE_VIDEO, payload: { id, ...status } })
                                    
                                    const currentInterval = currentIntervalsRef.current.get(id) || INITIAL_POLL_INTERVAL
                                    const nextInterval = Math.min(currentInterval * BACKOFF_MULTIPLIER, MAX_POLL_INTERVAL)
                                    currentIntervalsRef.current.set(id, nextInterval)
                                    
                                    if (pollIntervalsRef.current.has(id)) {
                                        clearTimeout(pollIntervalsRef.current.get(id))
                                    }
                                    
                                    const newTimeoutId = setTimeout(checkStatus, nextInterval)
                                    pollIntervalsRef.current.set(id, newTimeoutId)
                                }
                            } catch (error) {
                                console.error('Error checking status:', error)
                            }
                        }
                        checkStatus()
                    },
                    INITIAL_POLL_INTERVAL
                )
                pollIntervalsRef.current.set(id, timeoutId)
            }
        })

        return () => {
            pollIntervalsRef.current.forEach(timeoutId => clearTimeout(timeoutId))
            pollIntervalsRef.current.clear()
            currentIntervalsRef.current.clear()
        }
    }, [state.processingVideos])

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

export function useVideos() {
    const context = useContext(VideoContext)
    if (!context) {
        throw new Error('useVideos must be used within a VideoProvider')
    }
    return context
}
