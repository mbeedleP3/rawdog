// Week One — hardcoded plan.
// Future iterations can load this from the weekly_plan table in Supabase.

export const WEEKLY_PLAN = {
  monday: {
    type: 'workout',
    label: 'Workout Day',
    items: [
      { key: 'protein_shake',      label: 'Morning protein shake',               category: 'habit'   },
      { key: 'wall_pushups',       label: 'Wall push-ups — 3 × 10',              category: 'workout' },
      { key: 'bodyweight_squats',  label: 'Bodyweight squats — 3 × 15',          category: 'workout' },
      { key: 'band_rows',          label: 'Resistance band rows — 3 × 12',       category: 'workout' },
      { key: 'dead_bug',           label: 'Dead bug — 3 × 8 per side',           category: 'workout' },
    ],
  },
  tuesday: {
    type: 'walk',
    label: 'Walk Day',
    items: [
      { key: 'protein_shake', label: 'Morning protein shake',         category: 'habit' },
      { key: 'walk',          label: 'Go for a walk (any distance)',  category: 'walk'  },
    ],
  },
  wednesday: {
    type: 'workout',
    label: 'Workout Day',
    items: [
      { key: 'protein_shake',      label: 'Morning protein shake',               category: 'habit'   },
      { key: 'wall_pushups',       label: 'Wall push-ups — 3 × 10',              category: 'workout' },
      { key: 'bodyweight_squats',  label: 'Bodyweight squats — 3 × 15',          category: 'workout' },
      { key: 'band_rows',          label: 'Resistance band rows — 3 × 12',       category: 'workout' },
      { key: 'dead_bug',           label: 'Dead bug — 3 × 8 per side',           category: 'workout' },
    ],
  },
  thursday: {
    type: 'walk',
    label: 'Walk Day',
    items: [
      { key: 'protein_shake', label: 'Morning protein shake',         category: 'habit' },
      { key: 'walk',          label: 'Go for a walk (any distance)',  category: 'walk'  },
    ],
  },
  friday: {
    type: 'workout',
    label: 'Workout Day',
    items: [
      { key: 'protein_shake',      label: 'Morning protein shake',               category: 'habit'   },
      { key: 'wall_pushups',       label: 'Wall push-ups — 3 × 10',              category: 'workout' },
      { key: 'bodyweight_squats',  label: 'Bodyweight squats — 3 × 15',          category: 'workout' },
      { key: 'band_rows',          label: 'Resistance band rows — 3 × 12',       category: 'workout' },
      { key: 'dead_bug',           label: 'Dead bug — 3 × 8 per side',           category: 'workout' },
    ],
  },
  saturday: {
    type: 'rest',
    label: 'Rest Day',
    items: [
      { key: 'protein_shake', label: 'Morning protein shake', category: 'habit' },
    ],
  },
  sunday: {
    type: 'rest',
    label: 'Rest Day',
    items: [
      { key: 'protein_shake', label: 'Morning protein shake', category: 'habit' },
    ],
  },
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
