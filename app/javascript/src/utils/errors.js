import { t } from 'i18next'
import { ApiError } from 'apis/client'

export const getErrorMessage = (error) =>
  error instanceof ApiError ? error.message : t('errors.generic')
