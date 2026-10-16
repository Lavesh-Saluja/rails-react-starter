import { HTTP_METHODS } from 'constants/api'
import { apiRoutes } from 'routes'
import { buildUrl } from 'utils/url'
import { apiRequest } from './client'

// The API wraps payloads ({ sample_items: [...] } / { sample_item: {...} });
// these functions unwrap them so hooks and components receive plain items.
const { index, show: showRoute } = apiRoutes.sampleItems

const fetch = async ({ signal } = {}) => {
  const { sample_items: sampleItems } = await apiRequest(index, { signal })
  return sampleItems
}

const show = async (id, { signal } = {}) => {
  const { sample_item: sampleItem } = await apiRequest(
    buildUrl(showRoute, { id }),
    { signal },
  )
  return sampleItem
}

const create = async (payload) => {
  const { sample_item: sampleItem } = await apiRequest(index, {
    method: HTTP_METHODS.POST,
    body: { sample_item: payload },
  })
  return sampleItem
}

const update = async ({ id, payload }) => {
  const { sample_item: sampleItem } = await apiRequest(
    buildUrl(showRoute, { id }),
    { method: HTTP_METHODS.PATCH, body: { sample_item: payload } },
  )
  return sampleItem
}

const destroy = (id) =>
  apiRequest(buildUrl(showRoute, { id }), { method: HTTP_METHODS.DELETE })

const sampleItemsApi = { fetch, show, create, update, destroy }

export default sampleItemsApi
