import { API_URL } from '../env'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  search?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

function buildUrl(path: string, search?: RequestOptions['search']) {
  const url = new URL(path.replace(/^\//, ''), API_URL.endsWith('/') ? API_URL : API_URL + '/')
  if (search) {
    for (const [k, v] of Object.entries(search)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, search, signal } = opts
  const res = await fetch(buildUrl(path, search), {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  // 5% of requests come back 500 with { message: 'Server Error' } — we surface
  // that as ApiError so the query layer can decide to retry, and so the toaster
  // can show the message.
  if (!res.ok) {
    let message = res.statusText
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      /* response wasn't JSON, fall through with statusText */
    }
    throw new ApiError(res.status, message)
  }

  return (await res.json()) as T
}
