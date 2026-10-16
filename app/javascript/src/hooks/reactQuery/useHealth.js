import { useQuery } from '@tanstack/react-query'
import healthApi from 'apis/health'
import { QUERY_KEYS } from 'constants/query'

export const useFetchApiHealth = () =>
  useQuery({
    queryKey: [QUERY_KEYS.API_HEALTH],
    queryFn: ({ signal }) => healthApi.live({ signal }),
    staleTime: Infinity,
    retry: false,
  })
