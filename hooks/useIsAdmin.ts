import { useUser } from '@clerk/expo'

export function useIsAdmin(): boolean {
  const { user } = useUser()
  return (user?.publicMetadata as { role?: string })?.role === 'admin'
}
