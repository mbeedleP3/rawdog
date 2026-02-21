import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { WEEKLY_PLAN } from '../data/weekOnePlan'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const PlanContext = createContext(null)

export function PlanProvider({ children }) {
  const [weeklyPlan, setWeeklyPlan] = useState(WEEKLY_PLAN)
  const [planName,   setPlanName]   = useState('Week One Plan')

  useEffect(() => {
    supabase
      .from('plans')
      .select('name, plan_data')
      .eq('is_active', true)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setWeeklyPlan(data.plan_data)
          setPlanName(data.name)
        }
        // on error, keep the hardcoded fallback already in state
      })
  }, [])

  const getDayPlan = (date) => weeklyPlan[DAY_KEYS[date.getDay()]]

  return (
    <PlanContext.Provider value={{ weeklyPlan, planName, getDayPlan }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)
