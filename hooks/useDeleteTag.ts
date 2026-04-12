import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTagsService } from '@/services/tagsService'

export function useDeleteTag() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createTagsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error) => {
      console.error('[useDeleteTag]', error)
    },
  })
}
