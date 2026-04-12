import type { CompletedTestData } from '@/types/dataTypes'

export function calcStreak(tests: CompletedTestData[]): number {
  const valid = tests.filter((t) => t.completedAt != null)
  if (!valid.length) return 0
  const days = [...new Set(valid.map((t) => new Date(t.completedAt!).toDateString()))]
  days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (const day of days) {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === cursor.getTime()) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function calcTodayTests(tests: CompletedTestData[]): number {
  const today = new Date().toDateString()
  return tests.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === today).length
}
