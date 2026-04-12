import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createBlogService } from '@/services/blogService'

export function useBlogPosts() {
  const { getToken } = useAuth()
  const service = useMemo(() => createBlogService(createApiClient(getToken)), [getToken])

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => service.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  return { posts, isLoading, error }
}
