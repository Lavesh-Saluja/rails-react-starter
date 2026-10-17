import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import Button from 'components/commons/Button'
import { BUTTON_VARIANT } from 'constants/ui'
import { routes } from 'routes'
import { formatDateTime } from 'utils/formatDate'
import { buildUrl } from 'utils/url'

const List = ({ items, editingId, deletingId, onEdit, onDelete }) => {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <p className="text-muted">{t('sampleItems.empty')}</p>
  }

  return (
    <ul>
      {items.map((item) => {
        const isDeleting = deletingId === item.id

        return (
          <li
            key={item.id}
            className={`flex flex-col items-start justify-between gap-4 border-t border-border py-3.5 sm:flex-row ${
              item.id === editingId ? '-mx-2 rounded-md bg-bg px-2' : ''
            }`}
          >
            <div className="min-w-0">
              <h3 className="wrap-anywhere">
                <Link to={buildUrl(routes.sampleItems.show, { id: item.id })}>
                  {item.name}
                </Link>
              </h3>
              {item.description && (
                <p className="my-1 wrap-anywhere whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
              <time dateTime={item.created_at} className="text-sm text-muted">
                {t('sampleItems.addedOn', {
                  date: formatDateTime(item.created_at),
                })}
              </time>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={BUTTON_VARIANT.SECONDARY}
                onClick={() => onEdit(item)}
                aria-label={t('sampleItems.actions.editLabel', {
                  name: item.name,
                })}
              >
                {t('sampleItems.actions.edit')}
              </Button>
              <Button
                variant={BUTTON_VARIANT.DANGER}
                onClick={() => onDelete(item)}
                disabled={isDeleting}
                aria-label={t('sampleItems.actions.deleteLabel', {
                  name: item.name,
                })}
              >
                {isDeleting
                  ? t('sampleItems.actions.deleting')
                  : t('sampleItems.actions.delete')}
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default List
