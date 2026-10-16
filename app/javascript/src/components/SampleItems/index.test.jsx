import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { t } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from 'apis/client'
import sampleItemsApi from 'apis/sampleItems'
import { routes } from 'routes'
import { renderApp } from '../../test/utils'

vi.mock('apis/sampleItems')

const buildItem = (overrides = {}) => ({
  id: 1,
  name: 'Notebook',
  description: 'A ruled notebook',
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  ...overrides,
})

const nameInput = () => screen.getByLabelText(t('sampleItems.form.name'))
const addButton = () =>
  screen.getByRole('button', { name: t('sampleItems.form.add') })

describe('Sample items page', () => {
  beforeEach(() => {
    vi.mocked(sampleItemsApi.fetch).mockResolvedValue([])
  })

  it('redirects the root path and shows the empty state', async () => {
    renderApp(routes.root)

    expect(screen.getByText(t('sampleItems.loading'))).toBeInTheDocument()
    expect(await screen.findByText(t('sampleItems.empty'))).toBeInTheDocument()
  })

  it('shows a load error and recovers on retry', async () => {
    vi.mocked(sampleItemsApi.fetch)
      .mockRejectedValueOnce(new ApiError(t('errors.network'), 0))
      .mockResolvedValueOnce([buildItem()])
    renderApp(routes.sampleItems.index)

    expect(await screen.findByText(t('errors.network'))).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: t('common.retry') }),
    )

    expect(await screen.findByText('Notebook')).toBeInTheDocument()
  })

  it('validates the name before calling the API', async () => {
    renderApp(routes.sampleItems.index)
    await screen.findByText(t('sampleItems.empty'))

    await userEvent.click(addButton())

    expect(
      screen.getByText(t('sampleItems.validation.nameRequired')),
    ).toBeInTheDocument()
    expect(nameInput()).toHaveAttribute('aria-invalid', 'true')
    expect(sampleItemsApi.create).not.toHaveBeenCalled()
  })

  it('creates an item and refreshes the list', async () => {
    const created = buildItem({ id: 2, name: 'Lamp', description: null })
    vi.mocked(sampleItemsApi.fetch)
      .mockResolvedValueOnce([])
      .mockResolvedValue([created])
    vi.mocked(sampleItemsApi.create).mockResolvedValue(created)
    renderApp(routes.sampleItems.index)
    await screen.findByText(t('sampleItems.empty'))

    await userEvent.type(nameInput(), '  Lamp ')
    await userEvent.click(addButton())

    expect(sampleItemsApi.create).toHaveBeenCalledWith({
      name: 'Lamp',
      description: null,
    })
    expect(
      await screen.findByText(
        t('sampleItems.notices.created', { name: 'Lamp' }),
      ),
    ).toBeInTheDocument()
    expect(
      await within(await screen.findByRole('list')).findByText('Lamp'),
    ).toBeVisible()
    expect(nameInput()).toHaveValue('')
  })

  it('shows server validation errors next to the field', async () => {
    vi.mocked(sampleItemsApi.create).mockRejectedValue(
      new ApiError('Validation failed', 422, {
        name: ['has already been used'],
      }),
    )
    renderApp(routes.sampleItems.index)
    await screen.findByText(t('sampleItems.empty'))

    await userEvent.type(nameInput(), 'Lamp')
    await userEvent.click(addButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Validation failed',
    )
    expect(screen.getByText('has already been used')).toBeInTheDocument()
    expect(nameInput()).toHaveValue('Lamp')
  })

  it('edits an existing item', async () => {
    vi.mocked(sampleItemsApi.fetch).mockResolvedValue([buildItem()])
    vi.mocked(sampleItemsApi.update).mockResolvedValue(
      buildItem({ name: 'Sketchbook' }),
    )
    renderApp(routes.sampleItems.index)

    await userEvent.click(
      await screen.findByRole('button', {
        name: t('sampleItems.actions.editLabel', { name: 'Notebook' }),
      }),
    )
    expect(nameInput()).toHaveValue('Notebook')
    await userEvent.clear(nameInput())
    await userEvent.type(nameInput(), 'Sketchbook')
    await userEvent.click(
      screen.getByRole('button', { name: t('sampleItems.form.save') }),
    )

    expect(sampleItemsApi.update).toHaveBeenCalledWith({
      id: 1,
      payload: { name: 'Sketchbook', description: 'A ruled notebook' },
    })
    expect(
      await screen.findByText(
        t('sampleItems.notices.updated', { name: 'Sketchbook' }),
      ),
    ).toBeInTheDocument()
    expect(addButton()).toBeEnabled()
  })

  it('deletes an item after confirmation', async () => {
    vi.mocked(sampleItemsApi.fetch)
      .mockResolvedValueOnce([buildItem()])
      .mockResolvedValue([])
    vi.mocked(sampleItemsApi.destroy).mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp(routes.sampleItems.index)

    await userEvent.click(
      await screen.findByRole('button', {
        name: t('sampleItems.actions.deleteLabel', { name: 'Notebook' }),
      }),
    )

    expect(sampleItemsApi.destroy).toHaveBeenCalledWith(1)
    expect(
      await screen.findByText(
        t('sampleItems.notices.deleted', { name: 'Notebook' }),
      ),
    ).toBeInTheDocument()
    expect(await screen.findByText(t('sampleItems.empty'))).toBeInTheDocument()
  })
})
