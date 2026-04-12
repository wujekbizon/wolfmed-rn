import { ApiClient } from './apiClient'
import { Test, CreateTestPayload, UpdateTestPayload } from '@/types/dataTypes'

export const createTestsService = (api: ApiClient) => ({
  getAll:  ()                                     => api.get<Test[]>('/tests'),
  getById: (id: string)                           => api.get<Test>(`/tests/${id}`),
  create:  (data: CreateTestPayload)              => api.post<Test>('/tests', data),
  update:  (id: string, data: UpdateTestPayload)  => api.put<Test>(`/tests/${id}`, data),
  remove:  (id: string)                           => api.delete<void>(`/tests/${id}`),
})
