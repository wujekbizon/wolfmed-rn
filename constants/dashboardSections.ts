export type DashboardSection = 'stats' | 'actions' | 'profile' | 'help' | 'news'

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
    help: {
      id: 'help',
      color: '#3b82f6',
      icon: 'information-circle',
      label: 'Help & Info',
    },
    news: {
      id: 'news',
      color: '#10b981',
      icon: 'newspaper',
      label: 'News Feed',
    },
}
  