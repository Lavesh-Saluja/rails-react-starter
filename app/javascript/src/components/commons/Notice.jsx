import { useTranslation } from 'react-i18next'
import Button from 'components/commons/Button'
import { NOTICE_KIND } from 'constants'
import { BUTTON_VARIANT } from 'constants/ui'

const Notice = ({ notice, onDismiss }) => {
  const { t } = useTranslation()

  const kindClasses =
    notice?.kind === NOTICE_KIND.ERROR
      ? 'bg-error-bg text-error-text'
      : 'bg-success-bg text-success-text'

  // Keep the live region mounted so screen readers announce new messages.
  return (
    <div role="status" aria-live="polite" className="empty:hidden">
      {notice && (
        <div
          className={`mb-5 flex items-center justify-between gap-4 rounded-lg px-3.5 py-2.5 ${kindClasses}`}
          role={notice.kind === NOTICE_KIND.ERROR ? 'alert' : undefined}
        >
          <span>{notice.text}</span>
          <Button variant={BUTTON_VARIANT.GHOST} onClick={onDismiss}>
            {t('common.dismiss')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Notice
