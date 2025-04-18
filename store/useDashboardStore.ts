import { create } from 'zustand'

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

interface DashboardState {
  activeSection: DashboardSection
  isCircleExpanded: boolean
  isMinimized: boolean
  setActiveSection: (section: DashboardSection) => void
  toggleCircleExpand: () => void
  toggleMinimized: () => void
  getSectionConfig: (section: DashboardSection) => SectionConfig
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  activeSection: 'stats',
  isCircleExpanded: false,
  isMinimized: false,
  setActiveSection: (section) => set({ activeSection: section }),
  toggleCircleExpand: () => set((state) => ({ isCircleExpanded: !state.isCircleExpanded })),
  toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized, isCircleExpanded: false })),
  getSectionConfig: (section) => DASHBOARD_SECTIONS[section],
})) 