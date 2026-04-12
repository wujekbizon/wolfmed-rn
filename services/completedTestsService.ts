import { ApiClient } from './apiClient'
import { CompletedTestData, SubmitTestPayload } from '@/types/dataTypes'

export const createCompletedTestsService = (api: ApiClient) => ({
  getByUser: (userId: string)         => api.get<CompletedTestData[]>(`/completedtests?userId=${userId}`),
  create:    (data: SubmitTestPayload) => api.post<CompletedTestData>('/completedtests', data),
  remove:    (id: string)             => api.delete<void>(`/completedtests/${id}`),
})
