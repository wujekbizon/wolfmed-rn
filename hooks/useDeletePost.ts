import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createBlogService } from '@/services/blogService'

export function useDeletePost() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => {
      const api = createApiClient(getToken)
      return createBlogService(api).remove(postId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
    },
    onError: (error) => {
      console.error('[useDeletePost]', error)
    },
  })
}
