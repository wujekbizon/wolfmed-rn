import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createCompletedTestsService } from '@/services/completedTestsService'
import { FormattedAnswer } from '@/types/dataTypes'

interface SubmitTestData {
  userId: string
  score: number
  testResult: FormattedAnswer[]
}

export function useSubmitCompletedTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitTestData) => {
      const api = createApiClient(getToken)
      return createCompletedTestsService(api).create(data)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['completedTests', variables.userId] })
    },
  })
}
