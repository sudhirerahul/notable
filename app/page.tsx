import Link from 'next/link'
import { ArrowRight, Calendar, Sparkles, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            <span className="text-2xl font-bold text-white">Notable</span>
          </div>
          <Link
            href="/signin"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold text-white leading-tight">
            Turn Meeting Transcripts into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {' '}
              Scheduled Tasks
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-powered task extraction and intelligent scheduling. Upload your meeting transcripts
            and watch as Notable automatically extracts actionable tasks and schedules them on your calendar.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/signin"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Extraction</h3>
              <p className="text-gray-400">
                GPT-4 powered task extraction with confidence scores for each identified action item
              </p>
            </div>

            <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="h-12 w-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-gray-400">
                Automatic time slot allocation respecting deadlines and your calendar availability
              </p>
            </div>

            <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Calendar Integration</h3>
              <p className="text-gray-400">
                Seamless Google Calendar integration with Slack notifications for your team
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p>© 2026 Notable. Built with Next.js and AI.</p>
        </div>
      </footer>
    </div>
  )
}
