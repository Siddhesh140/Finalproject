export interface Video {
  id: string
  title: string
  source_type: 'youtube' | 'upload'
  source_url?: string
  file_path?: string
  duration?: number
  thumbnail_url?: string
  status: VideoStatus
  progress: number
  is_liked: boolean
  transcript?: string
  error_message?: string
  created_at?: string
  updated_at?: string
}

export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface VideoUploadResponse {
  id: string
  title: string
  status: VideoStatus
  message: string
}

export interface VideoStatusResponse {
  id: string
  status: VideoStatus
  progress?: number
  message?: string
}

export interface ChatMessage {
  id: string | number
  video_id: string
  role: 'user' | 'assistant'
  content: string
  references?: ChatReference[]
  timestamp: string
}

export interface ChatReference {
  start: number
  end: number
  text: string
}

export interface ChatMessageRequest {
  videoId: string
  message: string
}

export interface ChatMessageResponse {
  message: string
  references?: ChatReference[]
}

export interface ChatHistoryResponse {
  video_id: string
  messages: ChatMessage[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
}

export interface QuizOption {
  id: string
  text: string
}

export interface Quiz {
  id: string
  video_id: string
  questions: QuizQuestion[]
  question_count: number
  created_at?: string
}

export interface QuizSubmitRequest {
  answers: Record<string, string>
}

export interface QuizResult {
  id: string
  quiz_id: string
  score: number
  total: number
  percentage: number
  analysis?: string
  knowledge_gaps?: string[]
  time_taken?: number
}

export interface SearchResult {
  video_id: string
  video_title: string
  text: string
  timestamp_start: number
  timestamp_end: number
  relevance_score: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}

export interface Note {
  id: string
  video_id: string
  content: string
  timestamp?: number
  created_at?: string
}

export interface ApiError {
  error: string
  message: string
  details?: unknown
}
