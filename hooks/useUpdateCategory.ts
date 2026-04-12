import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCategoriesService } from '@/services/categoriesService'
import { UpdateCategoryPayload } from '@/types/dataTypes'

export function useUpdateCategory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createCategoriesService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryPayload }) => service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('[useUpdateCategory]', error)
    },
  })
}
