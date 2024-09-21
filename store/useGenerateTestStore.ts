import { Test } from '@/types/dataTypes'
import { create } from 'zustand'

interface GenerateTestState {
  numberTests: number | null
  isTest: boolean
  tests: Test[]
  setNumberTests: (number: number | null) => void
  setIsTest: (value: boolean) => void
  setTests: (tests: Test[]) => void
}

export const useGenerateTestStore = create<GenerateTestState>()((set) => ({
  numberTests: null,
  isTest: true,
  tests: [],
  setNumberTests: (number) => set({ numberTests: number }),
  setIsTest: (value) => set({ isTest: value }),
  setTests: (tests) => set({ tests }),
}))
