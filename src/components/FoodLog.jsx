import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { formatLocalDate } from '../data/weekOnePlan'

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function FoodLog() {
  const today    = new Date()
  const todayStr = formatLocalDate(today)

  const [entries,       setEntries]       = useState([])
  const [inputText,     setInputText]     = useState('')
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
        if (error) console.error('Error loading food log:', error)
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
      .insert({ date: todayStr, entry_text: text })
      .select()
      .single()

    if (error) {
      console.error('Error saving food entry:', error)
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
      console.error('Error deleting food entry:', error)
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

  return (
    <div className="p-4 space-y-6">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-100">Food Log</h1>
        <p className="text-gray-500 text-sm mt-0.5">Just type what you ate — no tracking, no judgment</p>
      </div>

      {/* Entry form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. two eggs and toast, glass of OJ…"
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
            <p className="text-5xl mb-3">🍽️</p>
            <p className="text-sm">Nothing logged yet today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
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
                <p className="text-gray-600 text-xs mt-2">{formatTime(entry.logged_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
