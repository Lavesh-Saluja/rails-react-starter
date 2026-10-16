import { afterEach, describe, expect, it, vi } from 'vitest'
import sampleItemsApi from './sampleItems'

const item = { id: 3, name: 'Lamp', description: null }

const stubFetch = (body, status = 200) => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(body === null ? null : JSON.stringify(body), { status }),
    )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('sampleItemsApi', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('unwraps the list envelope', async () => {
    const fetchMock = stubFetch({ sample_items: [item] })

    await expect(sampleItemsApi.fetch()).resolves.toEqual([item])
    expect(fetchMock.mock.calls[0][0]).toBe('/api/sample_items')
  })

  it('unwraps a single item and builds the member URL', async () => {
    const fetchMock = stubFetch({ sample_item: item })

    await expect(sampleItemsApi.show(3)).resolves.toEqual(item)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/sample_items/3')
  })

  it('wraps the payload when creating and updating', async () => {
    const fetchMock = stubFetch({ sample_item: item }, 201)

    await expect(sampleItemsApi.create({ name: 'Lamp' })).resolves.toEqual(item)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      sample_item: { name: 'Lamp' },
    })

    stubFetch({ sample_item: item })
    await expect(
      sampleItemsApi.update({ id: 3, payload: { name: 'Lamp' } }),
    ).resolves.toEqual(item)
  })

  it('returns nothing on delete', async () => {
    stubFetch(null, 204)

    await expect(sampleItemsApi.destroy(3)).resolves.toBeUndefined()
  })
})
