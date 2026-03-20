import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createMessagesService } from '@/services/messagesService'

export function useSendMessage() {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: ({ email, message }: { email: string; message: string }) => {
      const api = createApiClient(getToken)
      return createMessagesService(api).send(email, message)
    },
    onError: (error) => {
      console.error('[useSendMessage]', error)
    },
  })
}
