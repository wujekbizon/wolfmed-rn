import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCategoriesService } from '@/services/categoriesService'
import { CreateCategoryPayload } from '@/types/dataTypes'

export function useCreateCategory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createCategoriesService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('[useCreateCategory]', error)
    },
  })
}
