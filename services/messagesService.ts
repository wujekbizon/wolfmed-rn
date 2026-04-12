import { ApiClient } from './apiClient'

export const createMessagesService = (api: ApiClient) => ({
  send: (email: string, message: string) =>
    api.post<void>('/messages', { email, messageContent: message }),
})
