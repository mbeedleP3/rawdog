import { usePlan } from '../contexts/PlanContext'

const DAY_KEYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const TYPE_STYLE = {
  workout: {
    border: 'border-emerald-800',
    bg:     'bg-emerald-900/20',
    badge:  'bg-emerald-900/50 text-emerald-400',
    label:  'Workout',
  },
  walk: {
    border: 'border-violet-800',
    bg:     'bg-violet-900/20',
    badge:  'bg-violet-900/50 text-violet-400',
    label:  'Walk',
  },
  rest: {
    border: 'border-gray-700',
    bg:     'bg-gray-800',
    badge:  'bg-gray-700 text-gray-400',
    label:  'Rest',
  },
}

const CATEGORY_DOT = {
  habit:   'bg-blue-400',
  workout: 'bg-emerald-500',
  walk:    'bg-violet-500',
}

const LEGEND = [
  { dot: 'bg-blue-400',    label: 'Daily habit' },
  { dot: 'bg-emerald-500', label: 'Workout'     },
  { dot: 'bg-violet-500',  label: 'Walk'        },
]

export default function PlanView() {
  const { weeklyPlan, planName } = usePlan()

  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-100">{planName}</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your current weekly program</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {LEGEND.map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${dot} inline-block`} />
            {label}
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div className="space-y-3 pb-4">
        {DAY_KEYS.map((dayKey, i) => {
          const plan  = weeklyPlan[dayKey]
          const style = TYPE_STYLE[plan.type]

          return (
            <div
              key={dayKey}
              className={`rounded-xl border-2 ${style.border} ${style.bg} p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-100">{DAY_NAMES[i]}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {style.label}
                </span>
              </div>

              <ul className="space-y-2">
                {plan.items.map((item) => (
                  <li key={item.key} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className={`w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0 ${
                      CATEGORY_DOT[item.category] || 'bg-gray-500'
                    }`} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

    </div>
  )
}
