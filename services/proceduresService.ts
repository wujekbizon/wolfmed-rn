import { ApiClient } from './apiClient'
import { Procedure } from '@/types/dataTypes'

export const createProceduresService = (api: ApiClient) => ({
  getAll:  ()                          => api.get<Procedure[]>('/procedures'),
  getById: (id: string)                => api.get<Procedure>(`/procedures/${id}`),
  create:  (data: unknown)             => api.post<Procedure>('/procedures', data),
  update:  (id: string, data: unknown) => api.put<Procedure>(`/procedures/${id}`, data),
  remove:  (id: string)                => api.delete<void>(`/procedures/${id}`),
})
