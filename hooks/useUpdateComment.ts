import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
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

  return useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentData) => {
      const api = createApiClient(getToken)
      return createCommentsService(api).update(commentId, content)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.blogPostId] })
    },
    onError: (error) => {
      console.error('[useUpdateComment]', error)
    },
  })
}
