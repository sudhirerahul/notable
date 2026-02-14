'use client'

import { Calendar, Clock, User, Pencil, Trash2, Check, X, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import ConfidenceBadge from './ConfidenceBadge'

interface TaskData {
  id: string
  title: string
  description: string | null
  owner: string
  dueDate: string | null
  duration: number | null
  confidence: number
  status: string
  scheduledStart: string | null
  scheduledEnd: string | null
  googleEventId: string | null
}

interface TaskCardProps {
  task: TaskData
  onEdit?: (task: TaskData) => void
  onDelete?: (taskId: string) => void
  onAccept?: (taskId: string) => void
  onReject?: (taskId: string) => void
}

export default function TaskCard({ task, onEdit, onDelete, onAccept, onReject }: TaskCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    scheduled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    conflict: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending Review',
    accepted: 'Accepted',
    scheduled: 'Scheduled',
    completed: 'Completed',
    conflict: 'Scheduling Conflict',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColors[task.status] || statusColors.pending}`}>
              {statusLabels[task.status] || task.status}
            </span>
          </div>
          {task.description && (
            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
          )}
        </div>
        <ConfidenceBadge confidence={task.confidence} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
        {task.owner && (
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>{task.owner}</span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        {(task.duration || task.duration === 0) && task.duration > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{task.duration} min</span>
          </div>
        )}
      </div>

      {task.scheduledStart && (
        <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" />
          Scheduled: {format(new Date(task.scheduledStart), 'MMM d, yyyy h:mm a')}
          {task.scheduledEnd && (
            <span>- {format(new Date(task.scheduledEnd), 'h:mm a')}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-800">
        {task.status === 'pending' && (
          <>
            <button
              onClick={() => onAccept?.(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-md text-sm transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Accept
            </button>
            <button
              onClick={() => onReject?.(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-md text-sm transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
          </>
        )}
        <button
          onClick={() => onEdit?.(task)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-sm transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete?.(task.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-sm transition-colors ml-auto"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
