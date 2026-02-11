'use client'

import { signIn } from 'next-auth/react'
import { Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Welcome to Notable</h2>
          <p className="text-gray-400">Sign in to start managing your meeting tasks</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-semibold transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>

        {/* Features */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">What you&apos;ll get:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">
              AI Task Extraction
            </span>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full">
              Smart Scheduling
            </span>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full">
              Calendar Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
