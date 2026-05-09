import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePlan } from '../contexts/PlanContext'
import { formatLocalDate } from '../data/weekOnePlan'

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

const CATEGORY_LABEL = {
  habit:    'Daily habit',
  workout:  'Workout',
  walk:     'Walk',
  recovery: 'Recovery',
}

const CATEGORY_COLOR = {
  habit:    'text-blue-400',
  workout:  'text-emerald-400',
  walk:     'text-violet-400',
  recovery: 'text-amber-400',
}

function CheckCircle({ checked, popping }) {
  return (
    <div
      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 bg-gray-700'
      } ${popping ? 'check-pop' : ''}`}
    >
      {checked && (
        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  )
}

export default function TodayView() {
  const { getDayPlan } = usePlan()
  const today    = new Date()
  const todayStr = formatLocalDate(today)
  const dayPlan  = getDayPlan(today)

  const [completions, setCompletions] = useState(new Set())
  const [notes,       setNotes]       = useState({})
  const [popping,     setPopping]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(new Set())

  useEffect(() => {
    supabase
      .from('checklist_completions')
      .select('item_key, notes')
      .eq('date', todayStr)
      .then(({ data, error }) => {
        if (error) console.error('Error loading completions:', error)
        else {
          const keys = new Set()
          const notesMap = {}
          for (const r of (data || [])) {
            keys.add(r.item_key)
            if (r.notes) notesMap[r.item_key] = r.notes
          }
          setCompletions(keys)
          setNotes(notesMap)
        }
        setLoading(false)
      })
  }, [todayStr])

  const toggleItem = async (itemKey) => {
    if (saving.has(itemKey)) return

    const wasChecked = completions.has(itemKey)

    setCompletions(prev => {
      const next = new Set(prev)
      wasChecked ? next.delete(itemKey) : next.add(itemKey)
      return next
    })

    if (!wasChecked) {
      setPopping(itemKey)
      setTimeout(() => setPopping(null), 300)
    }

    setSaving(prev => new Set([...prev, itemKey]))

    let error
    if (wasChecked) {
      ;({ error } = await supabase
        .from('checklist_completions')
        .delete()
        .eq('date', todayStr)
        .eq('item_key', itemKey))
    } else {
      ;({ error } = await supabase
        .from('checklist_completions')
        .upsert({ date: todayStr, item_key: itemKey }, { onConflict: 'date,item_key' }))
    }

    if (error) {
      console.error('Error toggling completion:', error)
      setCompletions(prev => {
        const next = new Set(prev)
        wasChecked ? next.add(itemKey) : next.delete(itemKey)
        return next
      })
    }

    setSaving(prev => {
      const next = new Set(prev)
      next.delete(itemKey)
      return next
    })
  }

  const saveNote = async (itemKey, text) => {
    const { error } = await supabase
      .from('checklist_completions')
      .upsert({ date: todayStr, item_key: itemKey, notes: text || null }, { onConflict: 'date,item_key' })
    if (error) console.error('Error saving note:', error)
  }

  const totalItems     = dayPlan.items.length
  const completedItems = dayPlan.items.filter(item => completions.has(item.key)).length
  const progress       = totalItems > 0 ? completedItems / totalItems : 0
  const allDone        = completedItems === totalItems && totalItems > 0

  const dayTypeLabel = {
    workout:  'Workout Day',
    walk:     'Walk Day',
    rest:     'Rest Day',
    recovery: 'Recovery Day',
  }[dayPlan.type]

  return (
    <div className="p-4 space-y-6">

      {/* Header */}
      <div className="pt-4">
        <p className="text-sm font-medium text-gray-500">
          {DAY_NAMES[today.getDay()]}, {MONTH_NAMES[today.getMonth()]} {today.getDate()}
        </p>
        <h1 className="text-2xl font-bold text-gray-100 mt-0.5">{dayTypeLabel}</h1>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm font-medium">
          <span className={allDone ? 'text-emerald-400' : 'text-gray-400'}>
            {allDone ? 'All done!' : `${completedItems} of ${totalItems} done`}
          </span>
          <span className="text-gray-600">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              allDone ? 'bg-emerald-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {allDone && (
          <p className="text-center text-emerald-400 font-semibold text-sm pt-1 animate-bounce">
            Crushed it today, Mark! 🎉
          </p>
        )}
      </div>

      {/* Checklist */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {dayPlan.items.map((item) => {
            const checked          = completions.has(item.key)
            const notesVisible     = item.hasNotes && checked

            return (
              <div
                key={item.key}
                className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  checked
                    ? 'bg-emerald-900/20 border-emerald-800'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                } ${saving.has(item.key) ? 'opacity-50' : ''}`}
              >
                <button
                  onClick={() => toggleItem(item.key)}
                  disabled={saving.has(item.key)}
                  className="w-full flex items-center gap-4 p-4 text-left active:scale-95"
                >
                  <CheckCircle checked={checked} popping={popping === item.key} />

                  <div className="flex-1 min-w-0">
                    <span className={`font-medium block transition-all duration-200 ${
                      checked ? 'text-gray-600 line-through' : 'text-gray-100'
                    }`}>
                      {item.label}
                    </span>
                    <span className={`text-xs mt-0.5 block ${CATEGORY_COLOR[item.category] || 'text-gray-500'}`}>
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                </button>

                {notesVisible && (
                  <div className="px-4 pb-3">
                    <textarea
                      className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg p-2.5 border border-gray-600 focus:border-amber-500 focus:outline-none resize-none placeholder-gray-600"
                      rows={2}
                      placeholder="What was the moment?"
                      value={notes[item.key] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [item.key]: e.target.value }))}
                      onBlur={e => saveNote(item.key, e.target.value)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
