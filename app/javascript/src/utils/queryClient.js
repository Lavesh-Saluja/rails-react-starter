import { QueryClient } from '@tanstack/react-query'
import { HTTP_STATUS } from 'constants/api'
import { MAX_QUERY_RETRIES, QUERY_STALE_TIME_MS } from 'constants/query'

// Retry only failures that may be transient (network errors and 5xx), never 4xx.
const shouldRetry = (failureCount, error) => {
  const status = error?.status
  const transient =
    status === HTTP_STATUS.NETWORK_ERROR ||
    status >= HTTP_STATUS.INTERNAL_SERVER_ERROR

  return transient && failureCount < MAX_QUERY_RETRIES
}

export const createQueryClient = (overrides = {}) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        ...overrides.queries,
      },
      mutations: { retry: false, ...overrides.mutations },
    },
  })
