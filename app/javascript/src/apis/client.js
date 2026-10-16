import { t } from 'i18next'
import {
  API_BASE_URL,
  HTTP_METHODS,
  HTTP_STATUS,
  JSON_CONTENT_TYPE,
} from 'constants/api'

// Single entry point for HTTP calls to the Rails API.
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status HTTP status, or 0 when the server could not be reached
   * @param {Record<string, string[]>} details per-field validation messages (422)
   */
  constructor(message, status, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const readJson = async (response) => {
  const text = await response.text()
  if (!text) return undefined

  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export const apiRequest = async (
  path,
  { method = HTTP_METHODS.GET, body, signal } = {},
) => {
  const headers = { Accept: JSON_CONTENT_TYPE }
  if (body !== undefined) headers['Content-Type'] = JSON_CONTENT_TYPE

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError(t('errors.network'), HTTP_STATUS.NETWORK_ERROR)
  }

  if (response.status === HTTP_STATUS.NO_CONTENT) return undefined

  const payload = await readJson(response)

  if (!response.ok) {
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : t('errors.requestFailed', { status: response.status })
    throw new ApiError(message, response.status, payload?.details ?? {})
  }

  if (payload === undefined) {
    throw new ApiError(t('errors.unexpectedResponse'), response.status)
  }

  return payload
}
