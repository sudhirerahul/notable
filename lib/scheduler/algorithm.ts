import { Task } from '@prisma/client'
import { getCalendarFreeBusy, createCalendarEvent } from '../integrations/google-calendar'
import { extractFreeSlots, findEarliestSlot, type TimeSlot } from './slots'

export interface ScheduledTask extends Task {
  scheduled: boolean
  error?: string
}

export async function scheduleTasks(
  tasks: Task[],
  accessToken: string,
  userSettings: {
    timeZone: string
    workingHoursStart: number
    workingHoursEnd: number
  }
): Promise<ScheduledTask[]> {
  // Sort tasks by earliest deadline first
  const sortedTasks = tasks.sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  // Get calendar free/busy data for the next 30 days
  const now = new Date()
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const freeBusyData = await getCalendarFreeBusy(accessToken, now, endDate)
  const freeSlots = extractFreeSlots(freeBusyData, userSettings)

  const scheduledTasks: ScheduledTask[] = []

  for (const task of sortedTasks) {
    const duration = task.duration || 60 // Default 1 hour

    try {
      // Find the earliest available slot before the deadline
      const slot = findEarliestSlot(
        freeSlots,
        duration,
        task.dueDate || endDate,
        userSettings
      )

      if (slot) {
        // Create calendar event
        const eventId = await createCalendarEvent(accessToken, {
          summary: task.title,
          description: task.description || '',
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
        })

        scheduledTasks.push({
          ...task,
          scheduledStart: slot.start,
          scheduledEnd: slot.end,
          googleEventId: eventId,
          status: 'scheduled',
          scheduled: true,
        })

        // Mark this slot as used
        consumeSlot(freeSlots, slot, duration)
      } else {
        // No available slot found
        scheduledTasks.push({
          ...task,
          scheduled: false,
          error: 'No available slots before deadline',
        })
      }
    } catch (error) {
      console.error('Error scheduling task:', task.id, error)
      scheduledTasks.push({
        ...task,
        scheduled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return scheduledTasks
}

function consumeSlot(slots: TimeSlot[], usedSlot: TimeSlot, duration: number) {
  const index = slots.indexOf(usedSlot)
  if (index === -1) return

  const slotDuration = usedSlot.end.getTime() - usedSlot.start.getTime()
  const durationMs = duration * 60 * 1000

  if (slotDuration === durationMs) {
    // Slot exactly matches duration, remove it
    slots.splice(index, 1)
  } else {
    // Slot is larger, split it
    const newStart = new Date(usedSlot.start.getTime() + durationMs)
    slots[index] = {
      start: newStart,
      end: usedSlot.end,
    }
  }
}
