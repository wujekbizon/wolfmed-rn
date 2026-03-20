import { ApiClient } from './apiClient'
import { Comment } from '@/types/dataTypes'

export const createCommentsService = (api: ApiClient) => ({
  create: (data: { blogPostId: string; userId: string; content: string }) =>
    api.post<Comment>('/comments', data),
  getByPostId: (blogPostId: string) =>
    api.get<Comment[]>(`/comments?blogPostId=${blogPostId}`),
  update: (id: string, content: string) =>
    api.put<Comment>(`/comments/${id}`, { content }),
  delete: (id: string) =>
    api.delete<void>(`/comments/${id}`),
})
