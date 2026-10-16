import { apiRoutes } from 'routes'
import { apiRequest } from './client'

// { status: 'ok', revision: '<commit>' }; revision is absent when the API does not know it.
const live = ({ signal } = {}) => apiRequest(apiRoutes.health.live, { signal })

const healthApi = { live }

export default healthApi
