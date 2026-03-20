import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createBlogService, PostFormData } from '@/services/blogService'

interface UpdatePostData {
  postId: string
  data: Partial<PostFormData>
}

export function useUpdatePost() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, data }: UpdatePostData) => {
      const api = createApiClient(getToken)
      return createBlogService(api).update(postId, data)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.postId] })
    },
    onError: (error) => {
      console.error('[useUpdatePost]', error)
    },
  })
}
