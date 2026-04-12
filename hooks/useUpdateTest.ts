import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createTestsService } from '@/services/testsService'
import { UpdateTestPayload } from '@/types/dataTypes'

export function useUpdateTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createTestsService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestPayload }) => service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
    onError: (error) => {
      console.error('[useUpdateTest]', error)
    },
  })
}
