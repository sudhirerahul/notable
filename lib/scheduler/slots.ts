import { addMinutes, isWithinInterval, setHours, setMinutes } from 'date-fns'

export interface TimeSlot {
  start: Date
  end: Date
}

export function extractFreeSlots(
  freeBusyData: any,
  userSettings: {
    workingHoursStart: number
    workingHoursEnd: number
  }
): TimeSlot[] {
  const busyPeriods: TimeSlot[] = freeBusyData.calendars?.primary?.busy || []
  const freeSlots: TimeSlot[] = []

  // Generate slots for the next 30 days within working hours
  const now = new Date()
  const daysAhead = 30

  for (let day = 0; day < daysAhead; day++) {
    const currentDay = new Date(now)
    currentDay.setDate(currentDay.getDate() + day)

    const dayStart = setMinutes(setHours(currentDay, userSettings.workingHoursStart), 0)
    const dayEnd = setMinutes(setHours(currentDay, userSettings.workingHoursEnd), 0)

    // Check if this time is free (not in busy periods)
    let currentSlotStart = dayStart

    while (currentSlotStart < dayEnd) {
      const slotEnd = addMinutes(currentSlotStart, 30) // Check in 30-min increments

      const isBusy = busyPeriods.some((busy) =>
        isWithinInterval(currentSlotStart, {
          start: new Date(busy.start),
          end: new Date(busy.end),
        })
      )

      if (!isBusy && slotEnd <= dayEnd) {
        // Merge with previous slot if adjacent
        const lastSlot = freeSlots[freeSlots.length - 1]
        if (lastSlot && lastSlot.end.getTime() === currentSlotStart.getTime()) {
          lastSlot.end = slotEnd
        } else {
          freeSlots.push({ start: currentSlotStart, end: slotEnd })
        }
      }

      currentSlotStart = slotEnd
    }
  }

  return freeSlots
}

export function findEarliestSlot(
  freeSlots: TimeSlot[],
  durationMinutes: number,
  deadline: Date,
  userSettings: {
    workingHoursStart: number
    workingHoursEnd: number
  }
): TimeSlot | null {
  const durationMs = durationMinutes * 60 * 1000

  for (const slot of freeSlots) {
    const slotDuration = slot.end.getTime() - slot.start.getTime()

    // Check if slot is large enough and before deadline
    if (slotDuration >= durationMs && slot.end <= deadline) {
      return {
        start: slot.start,
        end: new Date(slot.start.getTime() + durationMs),
      }
    }
  }

  return null
}
