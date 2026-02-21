import { useState } from 'react'
import { PlanProvider } from './contexts/PlanContext'
import TodayView from './components/TodayView'
import FoodLog from './components/FoodLog'
import WeeklySummary from './components/WeeklySummary'
import PlanView from './components/PlanView'

function IconToday() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconFood() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  )
}

function IconWeek() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconPlan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="8" y1="6"  x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6"  x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

const TABS = [
  { id: 'today', label: 'Today',  Icon: IconToday },
  { id: 'food',  label: 'Food',   Icon: IconFood  },
  { id: 'week',  label: 'Week',   Icon: IconWeek  },
  { id: 'plan',  label: 'Plan',   Icon: IconPlan  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')

  return (
    <PlanProvider>
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto bg-gray-900 min-h-screen relative">

        <main className="min-h-screen pb-20 overflow-y-auto">
          {activeTab === 'today' && <TodayView />}
          {activeTab === 'food'  && <FoodLog />}
          {activeTab === 'week'  && <WeeklySummary />}
          {activeTab === 'plan'  && <PlanView />}
        </main>

        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-gray-900 border-t border-gray-800 z-10"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors duration-150 ${
                  activeTab === id
                    ? 'text-emerald-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

      </div>
    </div>
    </PlanProvider>
  )
}
