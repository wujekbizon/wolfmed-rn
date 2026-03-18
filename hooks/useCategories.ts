import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createCategoriesService } from '@/services/categoriesService'

export function useCategories() {
  const { getToken } = useAuth()

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createCategoriesService(api).getAll()
    },
    staleTime: 30 * 60 * 1000,
  })

  return { categories, isLoading, error }
}
