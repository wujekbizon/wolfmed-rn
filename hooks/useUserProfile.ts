import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { createApiClient } from '@/services/apiClient'
import { createUserService } from '@/services/userService'

export function useUserProfile(userId: string | undefined) {
  const { getToken } = useAuth()

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createUserService(api).getByUserId(userId!)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })

  return { userProfile, isLoading, error }
}
