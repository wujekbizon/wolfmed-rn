import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createProceduresService } from '@/services/proceduresService'

export function useProcedures() {
  const { getToken } = useAuth()

  const { data: procedures = [], isLoading, error } = useQuery({
    queryKey: ['procedures'],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createProceduresService(api).getAll()
    },
    staleTime: 10 * 60 * 1000,
  })

  return { procedures, isLoading, error }
}
