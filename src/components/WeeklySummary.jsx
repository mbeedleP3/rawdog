import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getWeekDates, formatLocalDate, getDayPlan } from '../data/weekOnePlan'

const DAY_ABBREV   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_ABBREV = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const TYPE_BADGE = {
  workout: 'text-emerald-600',
  walk:    'text-violet-500',
  rest:    'text-gray-400',
}

export default function WeeklySummary() {
  const today      = new Date()
  const todayStr   = formatLocalDate(today)
  const weekDates  = getWeekDates(today)
  const startDate  = formatLocalDate(weekDates[0])
  const endDate    = formatLocalDate(weekDates[6])

  const [completionsByDate, setCompletionsByDate] = useState({})
  const [foodByDate,        setFoodByDate]        = useState({})
  const [loading,           setLoading]           = useState(true)

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

  // Tally overall week completion for the header
  const totalPossible  = weekDates.reduce((acc, d) => acc + getDayPlan(d).items.length, 0)
  const totalCompleted = weekDates.reduce((acc, d) => {
    const ds   = formatLocalDate(d)
    const plan = getDayPlan(d)
    const done = completionsByDate[ds] || new Set()
    return acc + plan.items.filter(item => done.has(item.key)).length
  }, 0)

  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900">This Week</h1>
        <p className="text-gray-400 text-sm mt-0.5">{weekLabel}</p>
        {!loading && (
          <p className="text-gray-500 text-sm mt-2 font-medium">
            {totalCompleted} / {totalPossible} items completed
          </p>
        )}
      </div>

      {/* Day cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
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
                className={`bg-white rounded-xl border-2 p-4 transition-opacity ${
                  isToday ? 'border-emerald-300' : 'border-gray-100'
                } ${isFuture ? 'opacity-35' : ''}`}
              >
                <div className="flex items-center gap-3">

                  {/* Day number */}
                  <div className="w-11 text-center flex-shrink-0">
                    <div className={`text-xs font-semibold uppercase tracking-wide ${
                      isToday ? 'text-emerald-500' : 'text-gray-400'
                    }`}>
                      {DAY_ABBREV[i]}
                    </div>
                    <div className={`text-xl font-bold leading-tight ${
                      isToday ? 'text-emerald-600' : 'text-gray-800'
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
                      <span className="text-xs text-gray-400">
                        {!isFuture && `${completedCount}/${totalItems}`}
                        {allDone && <span className="text-emerald-500 font-semibold ml-1">✓</span>}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          allDone ? 'bg-emerald-500' : pct > 0 ? 'bg-emerald-300' : ''
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
        <div className="flex items-center gap-5 justify-center text-xs text-gray-400 pb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            All done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" />
            Partial
          </span>
          <span className="flex items-center gap-1">🥗 Food logged</span>
        </div>
      )}

    </div>
  )
}
