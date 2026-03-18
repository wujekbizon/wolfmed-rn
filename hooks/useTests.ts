import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createTestsService } from '@/services/testsService'

export function useTests() {
  const { getToken } = useAuth()

  const { data: tests = [], isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createTestsService(api).getAll()
    },
    staleTime: 10 * 60 * 1000,
  })

  return { tests, isLoading, error }
}
