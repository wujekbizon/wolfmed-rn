import { API_BASE } from '@/constants/apiConfig'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const createApiClient = (getToken: () => Promise<string | null>) => {
  const request = async <T>(
    path: string,
    method: HttpMethod = 'GET',
    body?: unknown
  ): Promise<T> => {
    const token = await getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error((error as any).message ?? `HTTP ${response.status}`)
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  return {
    get:    <T>(path: string)                => request<T>(path, 'GET'),
    post:   <T>(path: string, body: unknown) => request<T>(path, 'POST', body),
    put:    <T>(path: string, body: unknown) => request<T>(path, 'PUT', body),
    delete: <T>(path: string)               => request<T>(path, 'DELETE'),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
