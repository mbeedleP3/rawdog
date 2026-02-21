import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePlan } from '../contexts/PlanContext'
import { getWeekDates, formatLocalDate } from '../data/weekOnePlan'

const DAY_ABBREV   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH_ABBREV = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const TYPE_BADGE = {
  workout: 'text-emerald-400',
  walk:    'text-violet-400',
  rest:    'text-gray-500',
}

export default function WeeklySummary() {
  const { getDayPlan } = usePlan()
  const today      = new Date()
  const todayStr   = formatLocalDate(today)
  const weekDates  = getWeekDates(today)
  const startDate  = formatLocalDate(weekDates[0])
  const endDate    = formatLocalDate(weekDates[6])

  const [completionsByDate, setCompletionsByDate] = useState({})
  const [foodByDate,        setFoodByDate]        = useState({})
  const [loading,           setLoading]           = useState(true)
  const [copied,            setCopied]            = useState(false)
  const [copying,           setCopying]           = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: compData, error: compErr }, { data: foodData, error: foodErr }] =
        await Promise.all([
          supabase
            .from('checklist_completions')
            .select('date, item_key')
            .gte('date', startDate)
            .lte('date', endDate),
          supabase
            .from('food_log')
            .select('date')
            .gte('date', startDate)
            .lte('date', endDate),
        ])

      if (compErr) console.error('Error loading completions:', compErr)
      else {
        const grouped = {}
        for (const row of compData) {
          if (!grouped[row.date]) grouped[row.date] = new Set()
          grouped[row.date].add(row.item_key)
        }
        setCompletionsByDate(grouped)
      }

      if (foodErr) console.error('Error loading food log:', foodErr)
      else {
        const grouped = {}
        for (const row of foodData) {
          grouped[row.date] = (grouped[row.date] || 0) + 1
        }
        setFoodByDate(grouped)
      }

      setLoading(false)
    }
    load()
  }, [startDate, endDate])

  const weekStart = weekDates[0]
  const weekEnd   = weekDates[6]
  const weekLabel = `${MONTH_ABBREV[weekStart.getMonth()]} ${weekStart.getDate()} – ${
    weekStart.getMonth() !== weekEnd.getMonth() ? MONTH_ABBREV[weekEnd.getMonth()] + ' ' : ''
  }${weekEnd.getDate()}`

  const totalPossible  = weekDates.reduce((acc, d) => acc + getDayPlan(d).items.length, 0)
  const totalCompleted = weekDates.reduce((acc, d) => {
    const ds   = formatLocalDate(d)
    const plan = getDayPlan(d)
    const done = completionsByDate[ds] || new Set()
    return acc + plan.items.filter(item => done.has(item.key)).length
  }, 0)

  const handleCopyCheckin = async () => {
    setCopying(true)
    try {

    // Fetch food entries with full text for the week
    const { data: foodEntries } = await supabase
      .from('food_log')
      .select('date, entry_text')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('logged_at')

    const foodEntriesByDate = {}
    for (const row of (foodEntries || [])) {
      if (!foodEntriesByDate[row.date]) foodEntriesByDate[row.date] = []
      foodEntriesByDate[row.date].push(row.entry_text)
    }

    const lines = [
      'Raw Dog — Weekly Check-in',
      weekLabel,
      '',
    ]

    let workoutDone = 0, workoutTotal = 0
    let walkDone    = 0, walkTotal    = 0
    let foodDays    = 0
    let itemsDone   = 0, itemsTotal   = 0
    const pastDates = weekDates.filter(d => formatLocalDate(d) <= todayStr)

    for (let i = 0; i < weekDates.length; i++) {
      const date    = weekDates[i]
      const dateStr = formatLocalDate(date)
      if (dateStr > todayStr) continue

      const dayPlan        = getDayPlan(date)
      const completedKeys  = completionsByDate[dateStr] || new Set()
      const completedCount = dayPlan.items.filter(item => completedKeys.has(item.key)).length
      const allDone        = completedCount === dayPlan.items.length
      const typeLabel      = { workout: 'Workout Day', walk: 'Walk Day', rest: 'Rest Day' }[dayPlan.type]

      lines.push(`${DAY_NAMES[i]}, ${MONTH_ABBREV[date.getMonth()]} ${date.getDate()} — ${typeLabel}`)
      lines.push(`${completedCount} / ${dayPlan.items.length} items`)

      for (const item of dayPlan.items) {
        lines.push(`  ${completedKeys.has(item.key) ? '✓' : '–'} ${item.label}`)
      }

      const entries = foodEntriesByDate[dateStr] || []
      if (entries.length > 0) {
        lines.push(`  Food: ${entries.join(' | ')}`)
        foodDays++
      } else {
        lines.push(`  No food logged`)
      }

      lines.push('')

      itemsDone  += completedCount
      itemsTotal += dayPlan.items.length
      if (dayPlan.type === 'workout') { workoutTotal++; if (allDone) workoutDone++ }
      if (dayPlan.type === 'walk')    { walkTotal++;    if (allDone) walkDone++    }
    }

    lines.push('─────────────────────────')
    lines.push('Totals')
    lines.push(`Workout days:  ${workoutDone} / ${workoutTotal} completed`)
    lines.push(`Walk days:     ${walkDone} / ${walkTotal} completed`)
    lines.push(`Food logged:   ${foodDays} / ${pastDates.length} days`)
    lines.push(`Checklist:     ${itemsDone} / ${itemsTotal} items`)

    const text = lines.join('\n')
    let success = false
    try {
      await navigator.clipboard.writeText(text)
      success = true
    } catch {
      // Fallback for iOS Safari when clipboard API is unavailable
      try {
        const el = document.createElement('textarea')
        el.value = text
        el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;'
        document.body.appendChild(el)
        el.focus()
        el.select()
        success = document.execCommand('copy')
        document.body.removeChild(el)
      } catch {
        success = false
      }
    }

    setCopying(false)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }

    } catch (err) {
      console.error('Check-in copy failed:', err)
      setCopying(false)
    }
  }

  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-100">This Week</h1>
        <p className="text-gray-500 text-sm mt-0.5">{weekLabel}</p>
        {!loading && (
          <p className="text-gray-400 text-sm mt-2 font-medium">
            {totalCompleted} / {totalPossible} items completed
          </p>
        )}
      </div>

      {/* Check-in export button */}
      {!loading && (
        <button
          onClick={handleCopyCheckin}
          disabled={copying}
          className={`w-full py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 ${
            copied
              ? 'border-emerald-700 bg-emerald-900/20 text-emerald-400'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600 text-gray-300'
          }`}
        >
          {copied ? '✓ Copied to clipboard' : copying ? 'Copying…' : 'Copy Check-in Summary'}
        </button>
      )}

      {/* Day cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-20 bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {weekDates.map((date, i) => {
            const dateStr        = formatLocalDate(date)
            const dayPlan        = getDayPlan(date)
            const isToday        = dateStr === todayStr
            const isFuture       = dateStr > todayStr
            const completedKeys  = completionsByDate[dateStr] || new Set()
            const completedCount = dayPlan.items.filter(item => completedKeys.has(item.key)).length
            const totalItems     = dayPlan.items.length
            const allDone        = completedCount === totalItems && !isFuture
            const hasFoodEntry   = (foodByDate[dateStr] || 0) > 0
            const pct            = totalItems > 0 ? (completedCount / totalItems) * 100 : 0

            return (
              <div
                key={dateStr}
                className={`bg-gray-800 rounded-xl border-2 p-4 transition-opacity ${
                  isToday ? 'border-emerald-700' : 'border-gray-700'
                } ${isFuture ? 'opacity-30' : ''}`}
              >
                <div className="flex items-center gap-3">

                  {/* Day number */}
                  <div className="w-11 text-center flex-shrink-0">
                    <div className={`text-xs font-semibold uppercase tracking-wide ${
                      isToday ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {DAY_ABBREV[i]}
                    </div>
                    <div className={`text-xl font-bold leading-tight ${
                      isToday ? 'text-emerald-400' : 'text-gray-200'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium ${TYPE_BADGE[dayPlan.type]}`}>
                        {dayPlan.type.charAt(0).toUpperCase() + dayPlan.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {!isFuture && `${completedCount}/${totalItems}`}
                        {allDone && <span className="text-emerald-400 font-semibold ml-1">✓</span>}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          allDone ? 'bg-emerald-500' : pct > 0 ? 'bg-emerald-700' : ''
                        }`}
                        style={{ width: `${isFuture ? 0 : pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Food indicator */}
                  <div
                    className={`w-7 text-center text-lg flex-shrink-0 transition-opacity ${
                      hasFoodEntry ? 'opacity-100' : 'opacity-15'
                    }`}
                    title={hasFoodEntry ? 'Food logged' : 'No food logged'}
                  >
                    🥗
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      {!loading && (
        <div className="flex items-center gap-5 justify-center text-xs text-gray-600 pb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            All done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
            Partial
          </span>
          <span className="flex items-center gap-1">🥗 Food logged</span>
        </div>
      )}

    </div>
  )
}
