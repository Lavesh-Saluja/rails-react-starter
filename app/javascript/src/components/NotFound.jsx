import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { routes } from 'routes'

const NotFound = () => {
  const { t } = useTranslation()

  return (
    <main className="page">
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
      <Link to={routes.root}>{t('notFound.backHome')}</Link>
    </main>
  )
}

export default NotFound
