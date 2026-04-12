import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createProceduresService } from '@/services/proceduresService'

export function useProcedures() {
  const { getToken } = useAuth()
  const service = useMemo(() => createProceduresService(createApiClient(getToken)), [getToken])

  const { data: procedures = [], isLoading, error } = useQuery({
    queryKey: ['procedures'],
    queryFn: () => service.getAll(),
    staleTime: 10 * 60 * 1000,
  })

  return { procedures, isLoading, error }
}
