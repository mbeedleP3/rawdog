import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePlan } from '../contexts/PlanContext'
import { getWeekDates, formatLocalDate } from '../data/weekOnePlan'

const DAY_ABBREV   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH_ABBREV = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const TYPE_BADGE = {
  workout:  'text-emerald-400',
  walk:     'text-violet-400',
  rest:     'text-gray-500',
  recovery: 'text-amber-400',
}

const LOG_CHIP = {
  food:      'bg-emerald-600 text-white',
  sleep:     'bg-violet-600 text-white',
  colostomy: 'bg-amber-600 text-white',
  drain:     'bg-sky-600 text-white',
  medicine:  'bg-rose-600 text-white',
}

const LOG_LABEL = {
  food:      'Food',
  sleep:     'Sleep',
  colostomy: 'Colostomy',
  drain:     'Drain',
  medicine:  'Medicine',
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function WeeklySummary() {
  const { getDayPlan } = usePlan()
  const today    = new Date()
  const todayStr = formatLocalDate(today)

  const [weekOffset,    setWeekOffset]    = useState(0)
  const [expandedDate,  setExpandedDate]  = useState(null)
  const [completionsByDate,  setCompletionsByDate]  = useState({})
  const [notesByDate,        setNotesByDate]        = useState({})
  const [foodEntriesByDate,  setFoodEntriesByDate]  = useState({})
  const [loading,            setLoading]            = useState(true)
  const [copied,             setCopied]             = useState(false)

  const refDate = new Date(today)
  refDate.setDate(today.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(refDate)
  const startDate = formatLocalDate(weekDates[0])
  const endDate   = formatLocalDate(weekDates[6])

  useEffect(() => {
    setLoading(true)
    setExpandedDate(null)
    const load = async () => {
      const [{ data: compData, error: compErr }, { data: foodData, error: foodErr }] =
        await Promise.all([
          supabase
            .from('checklist_completions')
            .select('date, item_key, notes')
            .gte('date', startDate)
            .lte('date', endDate),
          supabase
            .from('food_log')
            .select('date, entry_text, category')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('logged_at'),
        ])

      if (compErr) console.error('Error loading completions:', compErr)
      else {
        const grouped = {}
        const notesGrouped = {}
        for (const row of compData) {
          if (!grouped[row.date]) grouped[row.date] = new Set()
          grouped[row.date].add(row.item_key)
          if (row.notes) {
            if (!notesGrouped[row.date]) notesGrouped[row.date] = {}
            notesGrouped[row.date][row.item_key] = row.notes
          }
        }
        setCompletionsByDate(grouped)
        setNotesByDate(notesGrouped)
      }

      if (foodErr) console.error('Error loading log:', foodErr)
      else {
        const grouped = {}
        for (const row of foodData) {
          if (!grouped[row.date]) grouped[row.date] = []
          grouped[row.date].push({ text: row.entry_text, category: row.category || 'food' })
        }
        setFoodEntriesByDate(grouped)
      }

      setLoading(false)
    }
    load()
  }, [startDate, endDate])

  const weekStart  = weekDates[0]
  const weekEnd    = weekDates[6]
  const isThisWeek = weekOffset === 0
  const weekLabel  = `${MONTH_ABBREV[weekStart.getMonth()]} ${weekStart.getDate()} – ${
    weekStart.getMonth() !== weekEnd.getMonth() ? MONTH_ABBREV[weekEnd.getMonth()] + ' ' : ''
  }${weekEnd.getDate()}`

  const pastDatesInView = weekDates.filter(d => formatLocalDate(d) <= todayStr)
  const totalPossible   = pastDatesInView.reduce((acc, d) => acc + getDayPlan(d).items.length, 0)
  const totalCompleted  = pastDatesInView.reduce((acc, d) => {
    const ds   = formatLocalDate(d)
    const plan = getDayPlan(d)
    const done = completionsByDate[ds] || new Set()
    return acc + plan.items.filter(item => done.has(item.key)).length
  }, 0)

  const handleCopyCheckin = () => {
    const lines = [
      'Raw Dog — Weekly Check-in',
      weekLabel,
      '',
    ]

    let workoutDone = 0, workoutTotal = 0
    let walkDone    = 0, walkTotal    = 0
    let foodDays    = 0
    let itemsDone   = 0, itemsTotal   = 0

    for (let i = 0; i < weekDates.length; i++) {
      const date    = weekDates[i]
      const dateStr = formatLocalDate(date)
      if (dateStr > todayStr) continue

      const dayPlan        = getDayPlan(date)
      const completedKeys  = completionsByDate[dateStr] || new Set()
      const completedCount = dayPlan.items.filter(item => completedKeys.has(item.key)).length
      const allDone        = completedCount === dayPlan.items.length
      const typeLabel      = { workout: 'Workout Day', walk: 'Walk Day', rest: 'Rest Day', recovery: 'Recovery Day' }[dayPlan.type]

      lines.push(`${DAY_NAMES[i]}, ${MONTH_ABBREV[date.getMonth()]} ${date.getDate()} — ${typeLabel}`)
      lines.push(`${completedCount} / ${dayPlan.items.length} items`)

      const dayNotes = notesByDate[dateStr] || {}
      for (const item of dayPlan.items) {
        const note       = dayNotes[item.key]
        const noteSuffix = note ? ` — "${note}"` : ''
        lines.push(`  ${completedKeys.has(item.key) ? '✓' : '–'} ${item.label}${noteSuffix}`)
      }

      const entries = foodEntriesByDate[dateStr] || []
      if (entries.length > 0) {
        const byCategory = {}
        for (const e of entries) {
          if (!byCategory[e.category]) byCategory[e.category] = []
          byCategory[e.category].push(e.text)
        }
        for (const [cat, texts] of Object.entries(byCategory)) {
          const label = cat.charAt(0).toUpperCase() + cat.slice(1)
          lines.push(`  ${label}: ${texts.join(' | ')}`)
        }
        foodDays++
      } else {
        lines.push(`  No log entries`)
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
    lines.push(`Food logged:   ${foodDays} / ${pastDatesInView.length} days`)
    lines.push(`Checklist:     ${itemsDone} / ${itemsTotal} items`)

    const text = lines.join('\n')

    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
      .catch(() => {
        try {
          const el = document.createElement('textarea')
          el.value = text
          el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;'
          document.body.appendChild(el)
          el.focus()
          el.select()
          if (document.execCommand('copy')) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
          }
          document.body.removeChild(el)
        } catch { /* silent */ }
      })
  }

  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-100">
            {isThisWeek ? 'This Week' : 'Week of'}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 active:scale-95 transition-all"
              aria-label="Previous week"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              disabled={isThisWeek}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-25 disabled:pointer-events-none"
              aria-label="Next week"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
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
          className={`w-full py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
            copied
              ? 'border-emerald-700 bg-emerald-900/20 text-emerald-400'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600 text-gray-300'
          }`}
        >
          {copied ? '✓ Copied to clipboard' : 'Copy Check-in Summary'}
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
            const hasFoodEntry   = (foodEntriesByDate[dateStr] || []).length > 0
            const pct            = totalItems > 0 ? (completedCount / totalItems) * 100 : 0
            const isExpanded     = expandedDate === dateStr

            const logEntries     = foodEntriesByDate[dateStr] || []
            const entriesByCat   = logEntries.reduce((acc, e) => {
              if (!acc[e.category]) acc[e.category] = []
              acc[e.category].push(e.text)
              return acc
            }, {})

            return (
              <div
                key={dateStr}
                className={`bg-gray-800 rounded-xl border-2 overflow-hidden transition-opacity ${
                  isToday ? 'border-emerald-700' : 'border-gray-700'
                } ${isFuture ? 'opacity-30' : ''}`}
              >
                {/* Card header row — tappable to expand */}
                <button
                  onClick={() => !isFuture && setExpandedDate(isExpanded ? null : dateStr)}
                  disabled={isFuture}
                  className="w-full p-4 text-left active:bg-gray-700/50 transition-colors disabled:cursor-default"
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

                    {/* Log indicator */}
                    <div
                      className={`w-7 text-center text-lg flex-shrink-0 transition-opacity ${
                        hasFoodEntry ? 'opacity-100' : 'opacity-15'
                      }`}
                    >
                      📋
                    </div>

                    {/* Expand chevron */}
                    {!isFuture && (
                      <div className={`text-gray-600 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown />
                      </div>
                    )}

                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-700 space-y-4 pt-3">

                    {/* Checklist */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Checklist</p>
                      <div className="space-y-1.5">
                        {dayPlan.items.map(item => {
                          const done = completedKeys.has(item.key)
                          const note = (notesByDate[dateStr] || {})[item.key]
                          return (
                            <div key={item.key} className="flex items-start gap-2">
                              <span className={`mt-0.5 text-sm font-bold flex-shrink-0 ${done ? 'text-emerald-400' : 'text-gray-700'}`}>
                                {done ? '✓' : '–'}
                              </span>
                              <div>
                                <span className={`text-sm ${done ? 'text-gray-200' : 'text-gray-600'}`}>
                                  {item.label}
                                </span>
                                {note && (
                                  <p className="text-xs text-amber-400/80 mt-0.5 italic">"{note}"</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Log entries */}
                    {logEntries.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Log Entries</p>
                        <div className="space-y-2">
                          {Object.entries(entriesByCat).map(([cat, texts]) => (
                            <div key={cat} className="flex items-start gap-2">
                              <span className={`inline-flex flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${LOG_CHIP[cat] || 'bg-gray-600 text-white'}`}>
                                {LOG_LABEL[cat] || cat}
                              </span>
                              <div className="space-y-0.5">
                                {texts.map((text, idx) => (
                                  <p key={idx} className="text-sm text-gray-300 leading-relaxed">{text}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">No log entries for this day.</p>
                    )}

                  </div>
                )}
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
          <span className="flex items-center gap-1">📋 Logged</span>
        </div>
      )}

    </div>
  )
}
