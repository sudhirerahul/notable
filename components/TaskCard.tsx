'use client'

import { Task } from '@prisma/client'
import { Calendar, Clock, User, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import ConfidenceBadge from './ConfidenceBadge'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-gray-400 text-sm">{task.description}</p>
          )}
        </div>
        <ConfidenceBadge confidence={task.confidence} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
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

        {task.duration && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{task.duration} min</span>
          </div>
        )}
      </div>

      {task.scheduledStart && (
        <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-400">
          📅 Scheduled: {format(new Date(task.scheduledStart), 'PPp')}
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
        <button
          onClick={() => onEdit?.(task)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete?.(task.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
