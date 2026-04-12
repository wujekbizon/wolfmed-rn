import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCommentsService } from '@/services/commentsService'

export function useComments(blogPostId: string, options?: { enabled?: boolean }) {
  const { getToken } = useAuth()
  const service = useMemo(() => createCommentsService(createApiClient(getToken)), [getToken])

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', blogPostId],
    queryFn: () => service.getByPostId(blogPostId),
    enabled: (options?.enabled !== false) && !!blogPostId,
    staleTime: 2 * 60 * 1000,
  })

  return { comments, isLoading }
}
