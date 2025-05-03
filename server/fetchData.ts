import { Procedure, Test } from '@/types/dataTypes'
import tests from '../data/tests.json'
import procedures from '../data/procedures.json'

interface FileDataOperations {
  getAllProcedures: () => Promise<Procedure[]>
  getAllTests: () => Promise<Test[]>
}

const convertToTest = (test: any): Test => ({
  ...test,
  createdAt: test.createdAt ? new Date(test.createdAt) : null,
  updatedAt: test.updatedAt ? new Date(test.updatedAt) : null,
})

export const fileData: FileDataOperations = {
  getAllProcedures: async () => {
    try {
      return procedures as Procedure[]
    } catch (error) {
      console.error('Error fetching procedures:', error)
      return []
    }
  },
  getAllTests: async () => {
    try {
      return tests.map(convertToTest)
    } catch (error) {
      console.error('Error fetching tests:', error)
      return []
    }
  },
}
