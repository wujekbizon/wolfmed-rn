import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createCommentsService } from '@/services/commentsService'

interface UpdateCommentData {
  commentId: string
  blogPostId: string
  content: string
}

export function useUpdateComment() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createCommentsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentData) => service.update(commentId, content),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.blogPostId] })
    },
    onError: (error) => {
      console.error('[useUpdateComment]', error)
    },
  })
}
