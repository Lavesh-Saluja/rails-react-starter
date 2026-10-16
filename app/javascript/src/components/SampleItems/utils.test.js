import { t } from 'i18next'
import { describe, expect, it } from 'vitest'
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH } from './constants'
import { toPayload, validateSampleItem } from './utils'

describe('validateSampleItem', () => {
  it('accepts a name with an optional description', () => {
    expect(validateSampleItem({ name: 'Lamp', description: '' })).toEqual({})
  })

  it('requires a non-blank name', () => {
    expect(validateSampleItem({ name: '   ', description: '' })).toEqual({
      name: [t('sampleItems.validation.nameRequired')],
    })
  })

  it('enforces the length limits', () => {
    const errors = validateSampleItem({
      name: 'a'.repeat(NAME_MAX_LENGTH + 1),
      description: 'b'.repeat(DESCRIPTION_MAX_LENGTH + 1),
    })

    expect(Object.keys(errors)).toEqual(['name', 'description'])
  })
})

describe('toPayload', () => {
  it('trims values and sends a blank description as null', () => {
    expect(toPayload({ name: '  Lamp ', description: '  ' })).toEqual({
      name: 'Lamp',
      description: null,
    })
  })
})
