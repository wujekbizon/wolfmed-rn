import { Test } from '@/types/dataTypes'
import { create } from 'zustand'

interface GenerateTestState {
  numberTests: number | null
  isTest: boolean
  tests: Test[]
  selectedCategoryId: number | null
  setNumberTests: (number: number | null) => void
  setIsTest: (value: boolean) => void
  setTests: (tests: Test[]) => void
  setSelectedCategoryId: (id: number | null) => void
}

export const useGenerateTestStore = create<GenerateTestState>()((set) => ({
  numberTests: null,
  isTest: false,
  tests: [],
  selectedCategoryId: null,
  setNumberTests: (number) => set({ numberTests: number }),
  setIsTest: (value) => set({ isTest: value }),
  setTests: (tests) => set({ tests }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}))
