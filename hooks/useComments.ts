import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createCommentsService } from '@/services/commentsService'

export function useComments(blogPostId: string, options?: { enabled?: boolean }) {
  const { getToken } = useAuth()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', blogPostId],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createCommentsService(api).getByPostId(blogPostId)
    },
    enabled: (options?.enabled !== false) && !!blogPostId,
    staleTime: 2 * 60 * 1000,
  })

  return { comments, isLoading }
}
