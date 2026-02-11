export async function getCalendarFreeBusy(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
) {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/freeBusy',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: 'primary' }],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Calendar API error: ${response.statusText}`)
  }

  return await response.json()
}

export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string
    description: string
    start: string // ISO 8601
    end: string // ISO 8601
    attendees?: string[]
  }
): Promise<string> {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
        attendees: event.attendees?.map((email) => ({ email })),
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create calendar event: ${response.statusText}`)
  }

  const data = await response.json()
  return data.id
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: Partial<{
    summary: string
    description: string
    start: string
    end: string
  }>
) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updates,
        start: updates.start ? { dateTime: updates.start } : undefined,
        end: updates.end ? { dateTime: updates.end } : undefined,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to update calendar event: ${response.statusText}`)
  }

  return await response.json()
}
