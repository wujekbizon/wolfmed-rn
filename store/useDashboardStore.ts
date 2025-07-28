import { create } from 'zustand'
import { type SectionConfig , type DashboardSection, DASHBOARD_SECTIONS} from '@/constants/dashboardSections'


interface DashboardState {
  section: Record<DashboardSection, SectionConfig>,
  activeSection: DashboardSection
  isCircleExpanded: boolean
  isMinimized: boolean
  setActiveSection: (section: DashboardSection) => void
  toggleCircleExpand: () => void
  toggleMinimized: () => void
  getSectionConfig: (section: DashboardSection) => SectionConfig
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  section: DASHBOARD_SECTIONS,
  activeSection: 'profile',
  isCircleExpanded: false,
  isMinimized: true,
  setActiveSection: (section) => set({ activeSection: section }),
  toggleCircleExpand: () => set((state) => ({ isCircleExpanded: !state.isCircleExpanded })),
  toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized, isCircleExpanded: false })),
  getSectionConfig: (section) => get().section[section]
})) 