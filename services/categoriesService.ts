import { ApiClient } from './apiClient'
import { Category } from '@/types/dataTypes'

export const createCategoriesService = (api: ApiClient) => ({
  getAll:  ()                          => api.get<Category[]>('/categories'),
  getById: (id: number)                => api.get<Category>(`/categories/${id}`),
  create:  (data: unknown)             => api.post<Category>('/categories', data),
  update:  (id: number, data: unknown) => api.put<Category>(`/categories/${id}`, data),
  remove:  (id: number)                => api.delete<void>(`/categories/${id}`),
})
