import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTestsService } from '@/services/testsService'

export function useDeleteTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createTestsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
    onError: (error) => {
      console.error('[useDeleteTest]', error)
    },
  })
}
