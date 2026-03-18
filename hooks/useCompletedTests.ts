import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createCompletedTestsService } from '@/services/completedTestsService'

export function useCompletedTests(userId: string | undefined) {
  const { getToken } = useAuth()

  const { data: completedTests = [], isLoading, error } = useQuery({
    queryKey: ['completedTests', userId],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createCompletedTestsService(api).getByUser(userId!)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  return { completedTests, isLoading, error }
}
