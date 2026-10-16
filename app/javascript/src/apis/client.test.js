import { t } from 'i18next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './client'

const mockFetch = (result) => {
  const fetchMock =
    result instanceof Error
      ? vi.fn().mockRejectedValue(result)
      : vi.fn().mockResolvedValue(result)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('apiRequest', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends JSON and returns the parsed response', async () => {
    const fetchMock = mockFetch(jsonResponse({ id: 1 }, 201))

    const result = await apiRequest('/api/things', {
      method: 'POST',
      body: { name: 'A' },
    })

    expect(result).toEqual({ id: 1 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/things')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"name":"A"}')
  })

  it('returns undefined for 204 No Content', async () => {
    mockFetch(new Response(null, { status: 204 }))

    await expect(
      apiRequest('/api/things/1', { method: 'DELETE' }),
    ).resolves.toBeUndefined()
  })

  it('throws ApiError with the server message and validation details', async () => {
    mockFetch(
      jsonResponse(
        { error: 'Validation failed', details: { name: ["can't be blank"] } },
        422,
      ),
    )

    const error = await apiRequest('/api/things').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      message: 'Validation failed',
      details: { name: ["can't be blank"] },
    })
  })

  it('throws a translated ApiError for non-JSON error responses', async () => {
    mockFetch(new Response('<html>Bad gateway</html>', { status: 502 }))

    await expect(apiRequest('/api/things')).rejects.toMatchObject({
      status: 502,
      message: t('errors.requestFailed', { status: 502 }),
    })
  })

  it('throws a translated ApiError with status 0 when the network fails', async () => {
    mockFetch(new TypeError('Failed to fetch'))

    await expect(apiRequest('/api/things')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: t('errors.network'),
    })
  })
})
