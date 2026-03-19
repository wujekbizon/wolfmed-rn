import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createUserService } from '@/services/userService'

export function useUserProfile(userId: string | undefined) {
  const { getToken } = useAuth()

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      console.log('[useUserProfile] fetching for userId:', userId)
      const api = createApiClient(getToken)
      const result = await createUserService(api).getByUserId(userId!)
      console.log('[useUserProfile] result:', JSON.stringify(result))
      return result
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  })

  if (error) console.error('[useUserProfile] error:', error)

  return { userProfile, isLoading, error }
}
