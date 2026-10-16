import { useTranslation } from 'react-i18next'
import { NOTICE_KIND } from 'constants'

const Notice = ({ notice, onDismiss }) => {
  const { t } = useTranslation()

  // Keep the live region mounted so screen readers announce new messages.
  return (
    <div role="status" aria-live="polite" className="notice-region">
      {notice && (
        <div
          className={`notice notice--${notice.kind}`}
          role={notice.kind === NOTICE_KIND.ERROR ? 'alert' : undefined}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            className="button button--ghost"
            onClick={onDismiss}
          >
            {t('common.dismiss')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Notice
