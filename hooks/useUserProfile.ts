import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createApiClient } from '@/services/apiClient'
import { createUserService } from '@/services/userService'

export function useUserProfile(userId: string | undefined) {
  const { getToken } = useAuth()
  const service = useMemo(() => createUserService(createApiClient(getToken)), [getToken])

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const result = await service.getByUserId(userId!)
      console.log('[useUserProfile] fetched:', JSON.stringify(result))
      return result
    },
    enabled: !!userId,
    staleTime: 0,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })

  return { userProfile, isLoading, error }
}
