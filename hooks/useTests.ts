import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTestsService } from '@/services/testsService'

export function useTests() {
  const { getToken } = useAuth()
  const service = useMemo(() => createTestsService(createApiClient(getToken)), [getToken])

  const { data: tests = [], isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: () => service.getAll(),
    staleTime: 10 * 60 * 1000,
  })

  return { tests, isLoading, error }
}
