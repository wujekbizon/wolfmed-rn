import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createBlogService } from '@/services/blogService'

export function useBlogPosts() {
  const { getToken } = useAuth()

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createBlogService(api).getAll()
    },
    staleTime: 5 * 60 * 1000,
  })

  return { posts, isLoading, error }
}
