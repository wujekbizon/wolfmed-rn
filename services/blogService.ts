import { ApiClient } from './apiClient'
import { Post } from '@/types/dataTypes'

export interface PostFormData {
  title: string
  excerpt: string
  content: string
  date: string
}

export const createBlogService = (api: ApiClient) => ({
  getAll:  ()                                      => api.get<Post[]>('/blogposts'),
  getById: (id: string)                            => api.get<Post>(`/blogposts/${id}`),
  create:  (data: PostFormData)                    => api.post<Post>('/blogposts', data),
  update:  (id: string, data: Partial<PostFormData>) => api.put<Post>(`/blogposts/${id}`, data),
  remove:  (id: string)                            => api.delete<void>(`/blogposts/${id}`),
})
