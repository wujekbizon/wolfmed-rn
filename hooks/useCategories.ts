import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCategoriesService } from '@/services/categoriesService'

export function useCategories() {
  const { getToken } = useAuth()
  const service = useMemo(() => createCategoriesService(createApiClient(getToken)), [getToken])

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => service.getAll(),
    staleTime: 30 * 60 * 1000,
  })

  return { categories, isLoading, error }
}
