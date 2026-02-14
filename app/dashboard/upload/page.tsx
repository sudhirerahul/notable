'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, FileText } from 'lucide-react'

const SAMPLE_TRANSCRIPT = `Product Planning Meeting - Q1 2026 Roadmap
Date: February 11, 2026
Attendees: Sarah (Product Manager), Mike (Engineering Lead), Alex (Designer), Jordan (Marketing)

[00:00] Sarah: Good morning everyone! Thanks for joining. Today we need to finalize our Q1 roadmap and assign action items. Let's start with the mobile app redesign.

[00:45] Alex: I've been working on the new UI mockups. I should have the final designs ready by Friday this week. Once approved, I'll need about two weeks to create the complete design system.

[01:20] Sarah: Perfect. Mike, can you review Alex's designs by next Monday and provide feedback?

[01:35] Mike: Sure, I'll block out time on Monday afternoon to review them thoroughly. I'll also need to set up the new development environment for the mobile team by end of this month.

[02:10] Sarah: Great. Jordan, what's the status on the marketing campaign?

[02:25] Jordan: We're almost done with the content calendar. I need to schedule a meeting with the social media team by next Wednesday to finalize the posting schedule. Also, I'll prepare the press release draft and send it to everyone for review by February 20th.

[03:00] Alex: For the design system, I'll need input from Mike's team. Can we schedule a design review session?

[03:15] Mike: How about next Thursday at 2 PM? That gives me time to review your initial designs first.

[03:30] Alex: Works for me. I'll send calendar invites today.

[04:00] Sarah: Excellent. Let me summarize the action items:
- Alex will complete the UI mockups by Friday
- Mike will review the designs by Monday and provide feedback
- Mike will set up the development environment by end of February
- Jordan will meet with social media team by next Wednesday
- Jordan will send press release draft by February 20th
- Alex will schedule design review for next Thursday at 2 PM

[04:45] Sarah: One more thing - we need someone to update the product roadmap document with these decisions. Mike, can you handle that?

[05:00] Mike: Yes, I'll update the roadmap doc and share it with the team by tomorrow end of day.

[05:15] Jordan: I also need to coordinate with the sales team about the new pricing tiers. I'll set up a meeting with them before the end of this week.

[05:40] Sarah: Perfect. Anything else before we wrap up?

[06:00] Alex: Just wanted to mention - I'll also need to conduct user research sessions for the new features. I'll schedule those for next week and compile findings by March 1st.

[06:30] Sarah: Great! Thanks everyone. Let's reconvene next Friday to check progress on all these items. Meeting adjourned.`

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadSample = () => {
    setTitle('Product Planning Meeting - Q1 2026 Roadmap')
    setContent(SAMPLE_TRANSCRIPT)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to upload transcript')
      }

      const data = await response.json()
      router.push(`/dashboard/transcripts/${data.transcript.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Upload Transcript</h1>
        <button
          type="button"
          onClick={loadSample}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
        >
          <FileText className="h-4 w-4" />
          Load Sample Transcript
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Meeting Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Sprint Planning - January 2026"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
            Transcript Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            placeholder="Paste your meeting transcript here...&#10;&#10;Example:&#10;Alice: We need to finalize the design specs by Friday.&#10;Bob: I'll take that action item. I'll also review the API documentation.&#10;..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono text-sm"
          />
          <p className="text-gray-500 text-sm mt-2">
            {content.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Extracting Tasks...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Extract Tasks
            </>
          )}
        </button>
      </form>
    </div>
  )
}
