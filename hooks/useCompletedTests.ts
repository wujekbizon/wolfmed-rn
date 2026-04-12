import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCompletedTestsService } from '@/services/completedTestsService'

export function useCompletedTests(userId: string | undefined) {
  const { getToken } = useAuth()
  const service = useMemo(() => createCompletedTestsService(createApiClient(getToken)), [getToken])

  const { data: completedTests = [], isLoading, error } = useQuery({
    queryKey: ['completedTests', userId],
    queryFn: () => service.getByUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  return { completedTests, isLoading, error }
}
