import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTagsService } from '@/services/tagsService'

export function useTags() {
  const { getToken } = useAuth()
  const service = useMemo(() => createTagsService(createApiClient(getToken)), [getToken])

  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: () => service.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  return { tags, isLoading, error }
}
