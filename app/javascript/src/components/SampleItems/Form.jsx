import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from 'apis/client'
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_ROWS,
  FIELD_IDS,
  NAME_MAX_LENGTH,
} from './constants'
import {
  errorId,
  hasErrors,
  toFormValues,
  toPayload,
  validateSampleItem,
} from './utils'

const FieldError = ({ fieldId, messages }) =>
  messages ? (
    <p id={errorId(fieldId)} className="field-error">
      {messages.join(' ')}
    </p>
  ) : null

/** Create form when `item` is null, edit form otherwise. */
const Form = ({ item, onSubmit, onCancel }) => {
  const { t } = useTranslation()
  const [values, setValues] = useState(() => toFormValues(item))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = item !== null

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const clientErrors = validateSampleItem(values)
    setErrors(clientErrors)
    if (hasErrors(clientErrors)) return

    setIsSubmitting(true)
    try {
      await onSubmit(toPayload(values))
      if (!isEditing) setValues(toFormValues(null))
    } catch (error) {
      // The page shows the general message; field-level details go next to the inputs.
      if (error instanceof ApiError) setErrors(error.details)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLabel = () => {
    if (isSubmitting) return t('sampleItems.form.saving')
    return isEditing ? t('sampleItems.form.save') : t('sampleItems.form.add')
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>
        {isEditing
          ? t('sampleItems.form.editTitle')
          : t('sampleItems.form.addTitle')}
      </h2>

      <div className="field">
        <label htmlFor={FIELD_IDS.name}>{t('sampleItems.form.name')}</label>
        <input
          id={FIELD_IDS.name}
          name="name"
          value={values.name}
          onChange={handleChange}
          maxLength={NAME_MAX_LENGTH}
          required
          autoFocus={isEditing}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? errorId(FIELD_IDS.name) : undefined}
        />
        <FieldError fieldId={FIELD_IDS.name} messages={errors.name} />
      </div>

      <div className="field">
        <label htmlFor={FIELD_IDS.description}>
          {t('sampleItems.form.description')}{' '}
          <span className="optional">{t('sampleItems.form.optional')}</span>
        </label>
        <textarea
          id={FIELD_IDS.description}
          name="description"
          rows={DESCRIPTION_ROWS}
          value={values.description}
          onChange={handleChange}
          maxLength={DESCRIPTION_MAX_LENGTH}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? errorId(FIELD_IDS.description) : undefined
          }
        />
        <FieldError
          fieldId={FIELD_IDS.description}
          messages={errors.description}
        />
      </div>

      <div className="actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {submitLabel()}
        </button>
        {isEditing && (
          <button
            type="button"
            className="button button--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('sampleItems.form.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}

export default Form
