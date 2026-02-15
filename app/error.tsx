'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-8 w-8 text-emerald-500" />
          <span className="text-2xl font-bold text-white">Notable</span>
        </div>
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
