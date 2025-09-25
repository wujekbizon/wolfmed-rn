// types.ts
export interface Trend {
    type: 'up' | 'down' | 'neutral'
    value: string
  }
  
  export interface StatItem {
    id: string
    title: string
    value: string | number
    subtitle: string
    icon: string
    progress: number
    trend?: Trend
  }