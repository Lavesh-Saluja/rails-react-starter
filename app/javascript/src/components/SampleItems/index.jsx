import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Notice from 'components/commons/Notice'
import LoadError from 'components/commons/LoadError'
import { NOTICE_KIND } from 'constants'
import {
  useCreateSampleItem,
  useDeleteSampleItem,
  useFetchSampleItems,
  useUpdateSampleItem,
} from 'hooks/reactQuery/useSampleItems'
import { getErrorMessage } from 'utils/errors'
import { LIST_HEADING_ID, NEW_ITEM_FORM_KEY } from './constants'
import Form from './Form'
import List from './List'

const SampleItems = () => {
  const { t } = useTranslation()
  const {
    data: items = [],
    isPending,
    isError,
    error,
    refetch,
  } = useFetchSampleItems()
  const { mutateAsync: createItem } = useCreateSampleItem()
  const { mutateAsync: updateItem } = useUpdateSampleItem()
  const deleteMutation = useDeleteSampleItem()
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState(null)

  const showSuccess = (text) => setNotice({ kind: NOTICE_KIND.SUCCESS, text })
  const showError = (err) =>
    setNotice({ kind: NOTICE_KIND.ERROR, text: getErrorMessage(err) })

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        const item = await updateItem({ id: editing.id, payload })
        setEditing(null)
        showSuccess(t('sampleItems.notices.updated', { name: item.name }))
      } else {
        const item = await createItem(payload)
        showSuccess(t('sampleItems.notices.created', { name: item.name }))
      }
    } catch (err) {
      showError(err)
      throw err
    }
  }

  const handleDelete = (item) => {
    if (!window.confirm(t('sampleItems.confirmDelete', { name: item.name })))
      return

    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        if (editing?.id === item.id) setEditing(null)
        showSuccess(t('sampleItems.notices.deleted', { name: item.name }))
      },
      onError: showError,
    })
  }

  const handleEdit = (item) => {
    setNotice(null)
    setEditing(item)
  }

  const renderItems = () => {
    if (isPending) return <p role="status">{t('sampleItems.loading')}</p>
    if (isError) return <LoadError error={error} onRetry={() => refetch()} />

    return (
      <List
        items={items}
        editingId={editing?.id ?? null}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>{t('sampleItems.title')}</h1>
        <p>{t('sampleItems.subtitle')}</p>
      </header>

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      <div className="layout">
        <Form
          key={editing?.id ?? NEW_ITEM_FORM_KEY}
          item={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />

        <section className="card" aria-labelledby={LIST_HEADING_ID}>
          <h2 id={LIST_HEADING_ID}>{t('sampleItems.listHeading')}</h2>
          {renderItems()}
        </section>
      </div>
    </main>
  )
}

export default SampleItems
