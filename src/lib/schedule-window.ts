export const START_WINDOW_MINUTES_BEFORE = 30
export const START_WINDOW_MINUTES_AFTER = 120

export function getScheduleWindow(scheduledAt: Date) {
  const windowStart = new Date(scheduledAt.getTime() - START_WINDOW_MINUTES_BEFORE * 60 * 1000)
  const windowEnd = new Date(scheduledAt.getTime() + START_WINDOW_MINUTES_AFTER * 60 * 1000)
  return { windowStart, windowEnd }
}

export function isWithinScheduleWindow(scheduledAt: Date, now = new Date()) {
  const { windowStart, windowEnd } = getScheduleWindow(scheduledAt)
  return now >= windowStart && now <= windowEnd
}

export function formatWindowText() {
  return `Starts ${START_WINDOW_MINUTES_BEFORE} minutes before until ${START_WINDOW_MINUTES_AFTER} minutes after scheduled time`
}
