import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { scheduleTasks } from '@/lib/scheduler/algorithm'
import { sendTaskNotification } from '@/lib/integrations/slack'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { taskIds } = body

    if (!taskIds || !Array.isArray(taskIds)) {
      return NextResponse.json(
        { error: 'Task IDs are required' },
        { status: 400 }
      )
    }

    // Find user and settings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
        accounts: {
          where: {
            provider: 'google',
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get tasks
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        userId: user.id,
      },
    })

    // Get Google access token from Account
    const googleAccount = user.accounts.find((acc) => acc.provider === 'google')
    const accessToken = googleAccount?.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please sign in again.' },
        { status: 400 }
      )
    }

    // Schedule tasks
    const scheduledTasks = await scheduleTasks(tasks, accessToken, {
      timeZone: user.settings?.timeZone || 'America/New_York',
      workingHoursStart: user.settings?.workingHoursStart || 9,
      workingHoursEnd: user.settings?.workingHoursEnd || 17,
    })

    // Update tasks in database
    const updatedTasks = await Promise.all(
      scheduledTasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            scheduledStart: task.scheduledStart,
            scheduledEnd: task.scheduledEnd,
            googleEventId: task.googleEventId,
            status: task.scheduled ? 'scheduled' : 'conflict',
          },
        })
      )
    )

    // Send Slack notifications if webhook is configured
    if (user.settings?.slackWebhookUrl) {
      try {
        const successfullyScheduled = updatedTasks.filter(
          (task) => task.status === 'scheduled'
        )
        if (successfullyScheduled.length > 0) {
          await sendTaskNotification(
            user.settings.slackWebhookUrl,
            successfullyScheduled
          )
        }
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError)
        // Don't fail the entire request if Slack notification fails
      }
    }

    return NextResponse.json({ scheduledTasks })
  } catch (error) {
    console.error('Error scheduling tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
