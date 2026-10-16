// Empty in development: /api is proxied by Vite. Set at build time for production.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/+$/,
  '',
)

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

export const HTTP_STATUS = {
  NETWORK_ERROR: 0,
  NO_CONTENT: 204,
  UNPROCESSABLE_CONTENT: 422,
  INTERNAL_SERVER_ERROR: 500,
}

export const JSON_CONTENT_TYPE = 'application/json'
