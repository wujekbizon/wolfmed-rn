import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createCommentsService } from '@/services/commentsService'

interface DeleteCommentData {
  commentId: string
  blogPostId: string
}

export function useDeleteComment() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentData) => {
      const api = createApiClient(getToken)
      return createCommentsService(api).delete(commentId)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.blogPostId] })
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.blogPostId] })
    },
    onError: (error) => {
      console.error('[useDeleteComment]', error)
    },
  })
}
