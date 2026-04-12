import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createBlogService, PostFormData } from '@/services/blogService'

export function useCreatePost() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createBlogService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (data: PostFormData) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
    },
    onError: (error) => {
      console.error('[useCreatePost]', error)
    },
  })
}
