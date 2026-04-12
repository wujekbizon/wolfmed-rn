import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCategoriesService } from '@/services/categoriesService'

export function useDeleteCategory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createCategoriesService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('[useDeleteCategory]', error)
    },
  })
}
