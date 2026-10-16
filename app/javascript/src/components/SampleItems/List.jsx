import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { routes } from 'routes'
import { formatDateTime } from 'utils/formatDate'
import { buildUrl } from 'utils/url'

const List = ({ items, editingId, deletingId, onEdit, onDelete }) => {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <p className="empty">{t('sampleItems.empty')}</p>
  }

  return (
    <ul className="item-list">
      {items.map((item) => {
        const isDeleting = deletingId === item.id

        return (
          <li
            key={item.id}
            className={`item${item.id === editingId ? ' item--editing' : ''}`}
          >
            <div className="item__body">
              <h3>
                <Link to={buildUrl(routes.sampleItems.show, { id: item.id })}>
                  {item.name}
                </Link>
              </h3>
              {item.description && <p>{item.description}</p>}
              <time dateTime={item.created_at}>
                {t('sampleItems.addedOn', {
                  date: formatDateTime(item.created_at),
                })}
              </time>
            </div>
            <div className="actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => onEdit(item)}
                aria-label={t('sampleItems.actions.editLabel', {
                  name: item.name,
                })}
              >
                {t('sampleItems.actions.edit')}
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => onDelete(item)}
                disabled={isDeleting}
                aria-label={t('sampleItems.actions.deleteLabel', {
                  name: item.name,
                })}
              >
                {isDeleting
                  ? t('sampleItems.actions.deleting')
                  : t('sampleItems.actions.delete')}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default List
