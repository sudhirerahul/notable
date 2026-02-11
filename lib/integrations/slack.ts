import { Task } from '@prisma/client'
import { format } from 'date-fns'

export async function sendTaskNotification(webhookUrl: string, tasks: Task[]) {
  if (!webhookUrl) {
    throw new Error('Slack webhook URL not configured')
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 New Tasks from Meeting',
      },
    },
    {
      type: 'divider',
    },
    ...tasks.map((task) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${task.title}*\n👤 ${task.owner}\n📅 ${
          task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No deadline'
        }\n⏰ ${
          task.scheduledStart
            ? `Scheduled: ${format(new Date(task.scheduledStart), 'PPp')}`
            : 'Not scheduled yet'
        }`,
      },
    })),
  ]

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send Slack notification: ${response.statusText}`)
  }

  return true
}
