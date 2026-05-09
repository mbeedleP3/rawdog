import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { formatLocalDate } from '../data/weekOnePlan'

const CATEGORIES = [
  { id: 'food',      label: 'Food',      placeholder: 'What did you eat or drink?'          },
  { id: 'sleep',     label: 'Sleep',     placeholder: 'Hours slept, quality...'              },
  { id: 'colostomy', label: 'Colostomy', placeholder: 'Times emptied, color, amount...'      },
  { id: 'drain',     label: 'Drain',     placeholder: 'Color, amount...'                     },
  { id: 'medicine',  label: 'Medicine',  placeholder: 'Medication name and dose...'          },
]

const CHIP_STYLE = {
  food:      { active: 'bg-emerald-600 text-white', inactive: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-emerald-500' },
  sleep:     { active: 'bg-violet-600 text-white',  inactive: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-violet-500'  },
  colostomy: { active: 'bg-amber-600 text-white',   inactive: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-amber-500'   },
  drain:     { active: 'bg-sky-600 text-white',     inactive: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-sky-500'     },
  medicine:  { active: 'bg-rose-600 text-white',    inactive: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-rose-500'    },
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function FoodLog() {
  const today    = new Date()
  const todayStr = formatLocalDate(today)

  const [entries,       setEntries]       = useState([])
  const [inputText,     setInputText]     = useState('')
  const [category,      setCategory]      = useState('food')
  const [loading,       setLoading]       = useState(true)
  const [submitting,    setSubmitting]    = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    supabase
      .from('food_log')
      .select('*')
      .eq('date', todayStr)
      .order('logged_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Error loading log:', error)
        else setEntries(data || [])
        setLoading(false)
      })
  }, [todayStr])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text || submitting) return

    setSubmitting(true)

    const { data, error } = await supabase
      .from('food_log')
      .insert({ date: todayStr, entry_text: text, category })
      .select()
      .single()

    if (error) {
      console.error('Error saving log entry:', error)
    } else {
      setEntries(prev => [data, ...prev])
      setInputText('')
      textareaRef.current?.focus()
    }

    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    const { error } = await supabase.from('food_log').delete().eq('id', id)
    if (error) {
      console.error('Error deleting log entry:', error)
    } else {
      setEntries(prev => prev.filter(e => e.id !== id))
    }
    setConfirmDelete(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  const activeCat   = CATEGORIES.find(c => c.id === category)
  const chipStyle   = CHIP_STYLE[category]

  return (
    <div className="p-4 space-y-6">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-100">Log</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track food, sleep, colostomy, drain, and more</p>
      </div>

      {/* Entry form */}
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const s = CHIP_STYLE[cat.id]
            const isActive = category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  isActive ? s.active : s.inactive
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeCat.placeholder}
          rows={3}
          className="w-full p-4 rounded-xl border-2 border-gray-700 bg-gray-800 focus:border-emerald-600 focus:outline-none resize-none text-gray-100 placeholder-gray-600 text-base transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || submitting}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl transition-all duration-150"
        >
          {submitting ? 'Logging…' : 'Log it'}
        </button>
        <p className="text-center text-xs text-gray-700">⌘ + Enter to submit</p>
      </form>

      {/* Today's entries */}
      <div>
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
          Today's entries
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-sm">Nothing logged yet today</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {entries.map((entry, i) => {
              const cat = entry.category || 'food'
              const s   = CHIP_STYLE[cat] || CHIP_STYLE.food
              const catLabel = CATEGORIES.find(c => c.id === cat)?.label || cat
              return (
                <div
                  key={entry.id}
                  className={`bg-gray-800 rounded-xl border border-gray-700 p-4 ${i === 0 ? 'slide-in' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-gray-100 text-base leading-relaxed">{entry.entry_text}</p>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      onBlur={() => setConfirmDelete(null)}
                      className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-colors ${
                        confirmDelete === entry.id
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:text-red-400'
                      }`}
                    >
                      {confirmDelete === entry.id ? 'Confirm?' : '✕'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.active}`}>
                      {catLabel}
                    </span>
                    <span className="text-gray-600 text-xs">{formatTime(entry.logged_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
