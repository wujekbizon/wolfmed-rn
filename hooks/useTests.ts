import { useQuery } from '@tanstack/react-query'
import { fileData } from '@/server/fetchData'
export function useTests() {
  const { 
    data: tests = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['tests'],
    queryFn: fileData.getAllTests,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })

  return {
    tests,
    isLoading,
    error,
  }
} 