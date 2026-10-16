import { t } from 'i18next'
import {
  DESCRIPTION_MAX_LENGTH,
  INITIAL_FORM_VALUES,
  NAME_MAX_LENGTH,
} from './constants'

export const toFormValues = (item) =>
  item
    ? { name: item.name, description: item.description ?? '' }
    : INITIAL_FORM_VALUES

export const toPayload = ({ name, description }) => ({
  name: name.trim(),
  description: description.trim() || null,
})

export const validateSampleItem = ({ name, description }) => {
  const errors = {}
  const trimmedName = name.trim()

  if (!trimmedName) {
    errors.name = [t('sampleItems.validation.nameRequired')]
  } else if (trimmedName.length > NAME_MAX_LENGTH) {
    errors.name = [
      t('sampleItems.validation.nameTooLong', { count: NAME_MAX_LENGTH }),
    ]
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = [
      t('sampleItems.validation.descriptionTooLong', {
        count: DESCRIPTION_MAX_LENGTH,
      }),
    ]
  }

  return errors
}

export const hasErrors = (errors) => Object.keys(errors).length > 0

export const errorId = (fieldId) => `${fieldId}-error`
