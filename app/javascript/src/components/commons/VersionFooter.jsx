import { useTranslation } from 'react-i18next'
import { APP_REVISION } from 'constants'
import { useFetchApiHealth } from 'hooks/reactQuery/useHealth'
import { shortRevision } from 'utils/revision'

/** Shows which commit the frontend and the API are running, to confirm a deploy. */
const VersionFooter = () => {
  const { t } = useTranslation()
  const { data, isError } = useFetchApiHealth()

  const apiVersion = () => {
    if (isError) return t('version.unavailable')
    if (!data) return t('common.loading')
    return shortRevision(data.revision) ?? t('version.development')
  }

  return (
    <footer className="px-4 pb-6 text-center text-[0.8125rem] text-muted">
      {t('version.summary', {
        web: shortRevision(APP_REVISION) ?? t('version.development'),
        api: apiVersion(),
      })}
    </footer>
  )
}

export default VersionFooter
