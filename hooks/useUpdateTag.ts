import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTagsService } from '@/services/tagsService'
import { UpdateTagPayload } from '@/types/dataTypes'

export function useUpdateTag() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createTagsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagPayload }) => service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error) => {
      console.error('[useUpdateTag]', error)
    },
  })
}
