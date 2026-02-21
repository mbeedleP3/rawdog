import { WEEKLY_PLAN } from '../data/weekOnePlan'

const DAY_KEYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const TYPE_STYLE = {
  workout: {
    border: 'border-emerald-200',
    bg:     'bg-emerald-50',
    badge:  'bg-emerald-100 text-emerald-700',
    label:  'Workout',
  },
  walk: {
    border: 'border-violet-200',
    bg:     'bg-violet-50',
    badge:  'bg-violet-100 text-violet-700',
    label:  'Walk',
  },
  rest: {
    border: 'border-gray-200',
    bg:     'bg-gray-50',
    badge:  'bg-gray-100 text-gray-500',
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
  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900">Week One Plan</h1>
        <p className="text-gray-400 text-sm mt-0.5">Your current weekly program</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {LEGEND.map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${dot} inline-block`} />
            {label}
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div className="space-y-3 pb-4">
        {DAY_KEYS.map((dayKey, i) => {
          const plan  = WEEKLY_PLAN[dayKey]
          const style = TYPE_STYLE[plan.type]

          return (
            <div
              key={dayKey}
              className={`rounded-xl border-2 ${style.border} ${style.bg} p-4`}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">{DAY_NAMES[i]}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {style.label}
                </span>
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {plan.items.map((item) => (
                  <li key={item.key} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className={`w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0 ${
                      CATEGORY_DOT[item.category] || 'bg-gray-400'
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
