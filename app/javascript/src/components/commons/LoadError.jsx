import { useTranslation } from 'react-i18next'
import Button from 'components/commons/Button'
import { getErrorMessage } from 'utils/errors'

const LoadError = ({ error, onRetry }) => {
  const { t } = useTranslation()

  return (
    <div role="alert" className="rounded-lg bg-error-bg p-3.5 text-error-text">
      <p className="mb-4">{getErrorMessage(error)}</p>
      <Button onClick={onRetry}>{t('common.retry')}</Button>
    </div>
  )
}

export default LoadError
