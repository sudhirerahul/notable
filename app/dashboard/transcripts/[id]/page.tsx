'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TaskCard from '@/components/TaskCard'
import TaskEditModal from '@/components/TaskEditModal'
import { Loader2, Calendar as CalendarIcon, ArrowLeft, CheckCheck, FileText } from 'lucide-react'

interface TaskData {
  id: string
  transcriptId: string
  userId: string
  title: string
  description: string | null
  owner: string
  dueDate: string | null
  confidence: number
  status: string
  scheduledStart: string | null
  scheduledEnd: string | null
  duration: number | null
  googleEventId: string | null
  createdAt: string
  updatedAt: string
}

interface Transcript {
  id: string
  title: string
  content: string
  status: string
  wordCount: number
  createdAt: string
  tasks: TaskData[]
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
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)

  const fetchTranscript = useCallback(async () => {
    try {
      const res = await fetch(`/api/transcripts/${id}/tasks`)
      const data = await res.json()
      setTranscript(data.transcript)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTranscript()
  }, [fetchTranscript])

  const showStatusMsg = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      })
      if (!res.ok) throw new Error('Failed to accept task')
      await fetchTranscript()
      showStatusMsg('success', 'Task accepted')
    } catch {
      showStatusMsg('error', 'Failed to accept task')
    }
  }

  const handleRejectTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      await fetchTranscript()
      showStatusMsg('success', 'Task rejected and removed')
    } catch {
      showStatusMsg('error', 'Failed to reject task')
    }
  }

  const handleAcceptAll = async () => {
    if (!transcript) return
    const pendingTasks = transcript.tasks.filter((t) => t.status === 'pending')
    try {
      await Promise.all(
        pendingTasks.map((task) =>
          fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'accepted' }),
          })
        )
      )
      await fetchTranscript()
      showStatusMsg('success', `${pendingTasks.length} tasks accepted`)
    } catch {
      showStatusMsg('error', 'Failed to accept all tasks')
    }
  }

  const handleEditSave = async (taskId: string, updates: Record<string, unknown>) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update task')
    await fetchTranscript()
    showStatusMsg('success', 'Task updated successfully')
  }

  const handleScheduleTasks = async () => {
    if (!transcript) return

    setScheduling(true)
    try {
      const taskIds = transcript.tasks
        .filter((t) => t.status === 'accepted' || t.status === 'pending')
        .map((t) => t.id)

      if (taskIds.length === 0) {
        showStatusMsg('error', 'No tasks to schedule. Accept tasks first.')
        setScheduling(false)
        return
      }

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to schedule tasks')
      }

      await fetchTranscript()
      showStatusMsg('success', 'Tasks scheduled to your Google Calendar!')
    } catch (error) {
      showStatusMsg('error', error instanceof Error ? error.message : 'Failed to schedule tasks')
    } finally {
      setScheduling(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      await fetchTranscript()
      showStatusMsg('success', 'Task deleted')
    } catch {
      showStatusMsg('error', 'Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-gray-400">Loading transcript...</p>
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Transcript not found</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-emerald-400 hover:text-emerald-300"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const pendingCount = transcript.tasks.filter((t) => t.status === 'pending').length
  const acceptedCount = transcript.tasks.filter((t) => t.status === 'accepted').length
  const scheduledCount = transcript.tasks.filter((t) => t.status === 'scheduled').length
  const schedulableCount = transcript.tasks.filter((t) => t.status === 'accepted' || t.status === 'pending').length

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{transcript.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span>{transcript.tasks.length} tasks extracted</span>
              {pendingCount > 0 && <span className="text-amber-400">{pendingCount} pending</span>}
              {acceptedCount > 0 && <span className="text-blue-400">{acceptedCount} accepted</span>}
              {scheduledCount > 0 && <span className="text-emerald-400">{scheduledCount} scheduled</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <button
                onClick={handleAcceptAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Accept All ({pendingCount})
              </button>
            )}
            {schedulableCount > 0 && (
              <button
                onClick={handleScheduleTasks}
                disabled={scheduling}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-colors"
              >
                {scheduling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Tasks
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Processing / Failed States */}
      {transcript.status === 'processing' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Extracting tasks from transcript...
        </div>
      )}

      {transcript.status === 'failed' && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          Failed to extract tasks. Please try uploading again.
        </div>
      )}

      {/* View Transcript Toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
      >
        <FileText className="h-4 w-4" />
        {showTranscript ? 'Hide' : 'View'} Original Transcript
      </button>

      {showTranscript && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
            {transcript.content}
          </pre>
        </div>
      )}

      {/* Tasks List */}
      {transcript.tasks.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">No tasks found in this transcript.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transcript.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => setEditingTask(t)}
              onDelete={handleDeleteTask}
              onAccept={handleAcceptTask}
              onReject={handleRejectTask}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleEditSave}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
