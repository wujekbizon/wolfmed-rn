import { ApiClient } from './apiClient'
import { User } from '@/types/dataTypes'

export const createUserService = (api: ApiClient) => ({
  getByUserId:    (userId: string)                       => api.get<User>(`/users/by-user-id/${userId}`),
  update:         (userId: string, data: Partial<User>)  => api.put<User>(`/users/${userId}`, data),
  getStats:       (userId: string)                       => api.get<User>(`/users/${userId}/stats`),
  upsert:         (data: { username: string; motto: string }) =>
                    api.post<User>('/users', data),
})
