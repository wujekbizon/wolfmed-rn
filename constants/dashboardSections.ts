export type DashboardSection = 'stats' | 'actions' | 'profile'

export interface SectionConfig {
  id: DashboardSection
  color: string
  icon: string
  label: string
}

export const DASHBOARD_SECTIONS: Record<DashboardSection, SectionConfig> = {
    stats: {
      id: 'stats',
      color: '#9333ea',
      icon: 'stats-chart',
      label: 'Statistics',
    },
    actions: {
      id: 'actions',
      color: '#ff69b4',
      icon: 'flash',
      label: 'Quick Actions',
    },
    profile: {
      id: 'profile',
      color: '#e11d48',
      icon: 'person',
      label: 'Profile',
    },
  }
  