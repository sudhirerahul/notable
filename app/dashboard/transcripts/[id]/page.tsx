'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TaskCard from '@/components/TaskCard'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'

interface Task {
  id: string
  transcriptId: string
  userId: string
  title: string
  description: string | null
  owner: string
  dueDate: Date | null
  confidence: number
  status: string
  scheduledStart: Date | null
  scheduledEnd: Date | null
  duration: number | null
  googleEventId: string | null
  createdAt: Date
  updatedAt: Date
}

interface Transcript {
  id: string
  title: string
  content: string
  status: string
  tasks: Task[]
}

export default function TranscriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    fetch(`/api/transcripts/${id}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTranscript(data.transcript)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [id])

  const handleScheduleTasks = async () => {
    if (!transcript) return

    setScheduling(true)
    try {
      const taskIds = transcript.tasks
        .filter((t) => t.status === 'pending' || t.status === 'accepted')
        .map((t) => t.id)

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule tasks')
      }

      // Refresh transcript data
      const updatedResponse = await fetch(`/api/transcripts/${id}/tasks`)
      const updatedData = await updatedResponse.json()
      setTranscript(updatedData.transcript)
    } catch (error) {
      console.error(error)
      alert('Failed to schedule tasks. Make sure Google Calendar is connected.')
    } finally {
      setScheduling(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })

      // Refresh transcript data
      const updatedResponse = await fetch(`/api/transcripts/${id}/tasks`)
      const updatedData = await updatedResponse.json()
      setTranscript(updatedData.transcript)
    } catch (error) {
      console.error(error)
      alert('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="text-center text-gray-400 py-12">
        Transcript not found
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">{transcript.title}</h1>
          <p className="text-gray-400 mt-2">
            {transcript.tasks.length} tasks extracted
          </p>
        </div>
        {transcript.tasks.some(
          (t) => t.status === 'pending' || t.status === 'accepted'
        ) && (
          <button
            onClick={handleScheduleTasks}
            disabled={scheduling}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {scheduling ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CalendarIcon className="h-5 w-5" />
                Schedule All Tasks
              </>
            )}
          </button>
        )}
      </div>

      {transcript.status === 'processing' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
          Extracting tasks from transcript...
        </div>
      )}

      {transcript.status === 'failed' && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          Failed to extract tasks. Please try uploading again.
        </div>
      )}

      {transcript.tasks.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">
            No tasks found in this transcript.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transcript.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
