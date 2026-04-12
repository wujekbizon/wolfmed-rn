import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTestsService } from '@/services/testsService'
import { CreateTestPayload } from '@/types/dataTypes'

export function useCreateTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createTestsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (data: CreateTestPayload) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
    onError: (error) => {
      console.error('[useCreateTest]', error)
    },
  })
}
