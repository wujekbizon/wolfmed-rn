import { ApiClient } from './apiClient'
import { Tag, CreateTagPayload, UpdateTagPayload } from '@/types/dataTypes'

export const createTagsService = (api: ApiClient) => ({
  getAll:  ()                                   => api.get<Tag[]>('/tags'),
  getById: (id: number)                         => api.get<Tag>(`/tags/${id}`),
  create:  (data: CreateTagPayload)             => api.post<Tag>('/tags', data),
  update:  (id: number, data: UpdateTagPayload) => api.put<Tag>(`/tags/${id}`, data),
  remove:  (id: number)                         => api.delete<void>(`/tags/${id}`),
})
