import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createCommentsService } from '@/services/commentsService'

interface AddCommentData {
  blogPostId: string
  userId: string
  content: string
}

export function useAddComment() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddCommentData) => {
      const api = createApiClient(getToken)
      return createCommentsService(api).create(data)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.blogPostId] })
    },
    onError: (error) => {
      console.error('[useAddComment]', error)
    },
  })
}
