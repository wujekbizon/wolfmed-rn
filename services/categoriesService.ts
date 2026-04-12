import { ApiClient } from './apiClient'
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/dataTypes'

export const createCategoriesService = (api: ApiClient) => ({
  getAll:  ()                                         => api.get<Category[]>('/categories'),
  getById: (id: number)                               => api.get<Category>(`/categories/${id}`),
  create:  (data: CreateCategoryPayload)              => api.post<Category>('/categories', data),
  update:  (id: number, data: UpdateCategoryPayload)  => api.put<Category>(`/categories/${id}`, data),
  remove:  (id: number)                               => api.delete<void>(`/categories/${id}`),
})
