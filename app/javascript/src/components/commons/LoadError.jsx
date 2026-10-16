import { useTranslation } from 'react-i18next'
import { getErrorMessage } from 'utils/errors'

const LoadError = ({ error, onRetry }) => {
  const { t } = useTranslation()

  return (
    <div role="alert" className="load-error">
      <p>{getErrorMessage(error)}</p>
      <button type="button" className="button" onClick={onRetry}>
        {t('common.retry')}
      </button>
    </div>
  )
}

export default LoadError
