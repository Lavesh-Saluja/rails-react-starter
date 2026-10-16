import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import LoadError from 'components/commons/LoadError'
import { useShowSampleItem } from 'hooks/reactQuery/useSampleItems'
import { routes } from 'routes'
import { formatDateTime } from 'utils/formatDate'

const Show = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const {
    data: item,
    isPending,
    isError,
    error,
    refetch,
  } = useShowSampleItem(id)

  const renderContent = () => {
    if (isPending) return <p role="status">{t('common.loading')}</p>
    if (isError) return <LoadError error={error} onRetry={() => refetch()} />

    return (
      <article className="card">
        <h1>{item.name}</h1>
        <dl className="details">
          <dt>{t('sampleItems.show.description')}</dt>
          <dd>{item.description || t('sampleItems.show.noDescription')}</dd>
          <dt>{t('sampleItems.show.createdAt')}</dt>
          <dd>
            <time dateTime={item.created_at}>
              {formatDateTime(item.created_at)}
            </time>
          </dd>
          <dt>{t('sampleItems.show.updatedAt')}</dt>
          <dd>
            <time dateTime={item.updated_at}>
              {formatDateTime(item.updated_at)}
            </time>
          </dd>
        </dl>
      </article>
    )
  }

  return (
    <main className="page">
      <p>
        <Link to={routes.sampleItems.index}>
          {t('sampleItems.actions.backToList')}
        </Link>
      </p>
      {renderContent()}
    </main>
  )
}

export default Show
