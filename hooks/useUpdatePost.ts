import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createBlogService, PostFormData } from '@/services/blogService'

interface UpdatePostData {
  postId: string
  data: Partial<PostFormData>
}

export function useUpdatePost() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createBlogService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: ({ postId, data }: UpdatePostData) => service.update(postId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.postId] })
    },
    onError: (error) => {
      console.error('[useUpdatePost]', error)
    },
  })
}
