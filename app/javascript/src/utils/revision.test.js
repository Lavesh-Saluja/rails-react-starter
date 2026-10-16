import { describe, expect, it } from 'vitest'
import { shortRevision } from './revision'

describe('shortRevision', () => {
  it('shortens a commit SHA', () => {
    expect(shortRevision('0482313dbbad2587c75e27eca268f3a69d5acbae')).toBe(
      '0482313',
    )
  })

  it('returns null for a missing revision', () => {
    expect(shortRevision('')).toBeNull()
    expect(shortRevision(undefined)).toBeNull()
  })
})
