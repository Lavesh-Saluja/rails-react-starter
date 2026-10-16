import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import sampleItemsApi from 'apis/sampleItems'
import { QUERY_KEYS } from 'constants/query'

const useInvalidateSampleItems = () => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SAMPLE_ITEMS] })
}

export const useFetchSampleItems = () =>
  useQuery({
    queryKey: [QUERY_KEYS.SAMPLE_ITEMS],
    queryFn: ({ signal }) => sampleItemsApi.fetch({ signal }),
  })

export const useShowSampleItem = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.SAMPLE_ITEMS, id],
    queryFn: ({ signal }) => sampleItemsApi.show(id, { signal }),
    enabled: Boolean(id),
  })

export const useCreateSampleItem = () => {
  const invalidate = useInvalidateSampleItems()

  return useMutation({
    mutationFn: (payload) => sampleItemsApi.create(payload),
    onSuccess: invalidate,
  })
}

export const useUpdateSampleItem = () => {
  const invalidate = useInvalidateSampleItems()

  return useMutation({
    mutationFn: ({ id, payload }) => sampleItemsApi.update({ id, payload }),
    onSuccess: invalidate,
  })
}

export const useDeleteSampleItem = () => {
  const invalidate = useInvalidateSampleItems()

  return useMutation({
    mutationFn: (id) => sampleItemsApi.destroy(id),
    onSuccess: invalidate,
  })
}
