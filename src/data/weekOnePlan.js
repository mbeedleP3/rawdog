// Recovery plan — post-surgery phase.
// Loaded from Supabase `plans` table; this serves as the hardcoded fallback.

const RECOVERY_ITEMS = [
  { key: 'protein_shake', label: 'Morning protein shake', category: 'habit'    },
  { key: 'walk_am',       label: 'Morning walk',          category: 'walk'     },
  { key: 'walk_pm',       label: 'Evening walk',          category: 'walk'     },
  { key: 'hydration',     label: 'Drink 64 oz of water',  category: 'recovery' },
  { key: 'bible_reading', label: 'Bible reading',         category: 'recovery' },
  { key: 'book_reading',  label: 'Book reading',          category: 'recovery' },
  { key: 'moment_of_joy', label: 'Find a moment of joy',  category: 'recovery', hasNotes: true },
]

const RECOVERY_DAY = { type: 'recovery', label: 'Recovery Day', items: RECOVERY_ITEMS }

export const WEEKLY_PLAN = {
  monday:    RECOVERY_DAY,
  tuesday:   RECOVERY_DAY,
  wednesday: RECOVERY_DAY,
  thursday:  RECOVERY_DAY,
  friday:    RECOVERY_DAY,
  saturday:  RECOVERY_DAY,
  sunday:    RECOVERY_DAY,
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export const getDayPlan = (date) => WEEKLY_PLAN[DAY_KEYS[date.getDay()]]

/** Returns YYYY-MM-DD in local time (avoids UTC-shift bugs) */
export const formatLocalDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Returns array of 7 Date objects Mon–Sun for the week containing `date` */
export const getWeekDates = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as week start
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const wd = new Date(monday)
    wd.setDate(monday.getDate() + i)
    return wd
  })
}
