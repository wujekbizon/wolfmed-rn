import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createBlogService, PostFormData } from '@/services/blogService'

export function useCreatePost() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PostFormData) => {
      const api = createApiClient(getToken)
      return createBlogService(api).create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
    },
    onError: (error) => {
      console.error('[useCreatePost]', error)
    },
  })
}
