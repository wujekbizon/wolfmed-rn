import { ApiClient } from './apiClient'
import { Comment } from '@/types/dataTypes'

export const createCommentsService = (api: ApiClient) => ({
  create: (data: { blogPostId: string; userId: string; content: string }) =>
    api.post<Comment>('/comments', data),
})
