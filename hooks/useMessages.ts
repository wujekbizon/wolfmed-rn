import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createMessagesService } from '@/services/messagesService'

export function useMessages() {
  const { getToken } = useAuth()
  const service = useMemo(() => createMessagesService(createApiClient(getToken)), [getToken])

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages'],
    queryFn: () => service.getAll(),
    staleTime: 2 * 60 * 1000,
  })

  return { messages, isLoading, error }
}
