import { screen } from '@testing-library/react'
import { t } from 'i18next'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from 'apis/client'
import sampleItemsApi from 'apis/sampleItems'
import { routes } from 'routes'
import { buildUrl } from 'utils/url'
import { renderApp } from '../../test/utils'

vi.mock('apis/sampleItems')

describe('Sample item detail page', () => {
  it('loads the item from the id in the URL', async () => {
    vi.mocked(sampleItemsApi.show).mockResolvedValue({
      id: 7,
      name: 'Lamp',
      description: null,
      created_at: '2026-01-01T10:00:00Z',
      updated_at: '2026-01-02T10:00:00Z',
    })
    renderApp(buildUrl(routes.sampleItems.show, { id: 7 }))

    expect(
      await screen.findByRole('heading', { name: 'Lamp' }),
    ).toBeInTheDocument()
    expect(sampleItemsApi.show).toHaveBeenCalledWith('7', expect.anything())
    expect(
      screen.getByText(t('sampleItems.show.noDescription')),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: t('sampleItems.actions.backToList') }),
    ).toHaveAttribute('href', routes.sampleItems.index)
  })

  it('shows the API error for a missing item', async () => {
    vi.mocked(sampleItemsApi.show).mockRejectedValue(
      new ApiError('Not found', 404),
    )
    renderApp(buildUrl(routes.sampleItems.show, { id: 999 }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Not found')
  })
})

describe('Unknown routes', () => {
  it('render the not found page', async () => {
    renderApp('/does-not-exist')

    expect(
      screen.getByRole('heading', { name: t('notFound.title') }),
    ).toBeInTheDocument()
  })
})
