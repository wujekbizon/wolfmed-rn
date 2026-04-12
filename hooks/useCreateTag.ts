import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTagsService } from '@/services/tagsService'
import { CreateTagPayload } from '@/types/dataTypes'

export function useCreateTag() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createTagsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (data: CreateTagPayload) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error) => {
      console.error('[useCreateTag]', error)
    },
  })
}
