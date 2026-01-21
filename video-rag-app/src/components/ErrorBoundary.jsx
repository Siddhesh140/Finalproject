import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
                    <div className="glass-card rounded-2xl p-8 max-w-md text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try again.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
