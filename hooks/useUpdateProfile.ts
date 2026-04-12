import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createUserService } from '@/services/userService'
import { User } from '@/types/dataTypes'

export function useUpdateProfile(userId: string | undefined) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const service = useMemo(() => createUserService(createApiClient(getToken)), [getToken])

  return useMutation({
    mutationFn: (patch: Partial<User>) => {
      const current = queryClient.getQueryData<User>(['userProfile', userId])
      const merged = { ...(current ?? {}), ...patch }
      return service.update(userId!, merged)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
    },
    onError: (error) => {
      console.error('[useUpdateProfile]', error)
    },
  })
}
