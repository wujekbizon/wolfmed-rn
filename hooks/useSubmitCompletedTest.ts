import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCompletedTestsService } from '@/services/completedTestsService'
import { SubmitTestPayload } from '@/types/dataTypes'

export function useSubmitCompletedTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createCompletedTestsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (data: SubmitTestPayload) => service.create(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['completedTests', variables.userId] })
      queryClient.resetQueries({ queryKey: ['userProfile', variables.userId] })
    },
    onError: (error) => {
      console.error('[useSubmitCompletedTest]', error)
    },
  })
}
