import { describe, expect, it } from 'vitest'
import { buildUrl } from './url'

describe('buildUrl', () => {
  it('replaces placeholders with encoded values', () => {
    expect(buildUrl('/items/:id/notes/:noteId', { id: 5, noteId: 'a b' })).toBe(
      '/items/5/notes/a%20b',
    )
  })

  it('leaves unknown placeholders untouched', () => {
    expect(buildUrl('/items/:id')).toBe('/items/:id')
  })
})
