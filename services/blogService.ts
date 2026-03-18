import { ApiClient } from './apiClient'
import { Post } from '@/types/dataTypes'

export const createBlogService = (api: ApiClient) => ({
  getAll:  ()                          => api.get<Post[]>('/blogposts'),
  getById: (id: string)                => api.get<Post>(`/blogposts/${id}`),
  create:  (data: unknown)             => api.post<Post>('/blogposts', data),
  update:  (id: string, data: unknown) => api.put<Post>(`/blogposts/${id}`, data),
  remove:  (id: string)                => api.delete<void>(`/blogposts/${id}`),
})
