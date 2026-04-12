import { ApiClient } from './apiClient'
import { CustomerMessage } from '@/types/dataTypes'

export const createMessagesService = (api: ApiClient) => ({
  send:   (email: string, message: string) =>
    api.post<void>('/messages', { email, messageContent: message }),
  getAll: () => api.get<CustomerMessage[]>('/messages'),
})
