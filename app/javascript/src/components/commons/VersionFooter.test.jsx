import { screen } from '@testing-library/react'
import { t } from 'i18next'
import { describe, expect, it, vi } from 'vitest'
import healthApi from 'apis/health'
import { routes } from 'routes'
import { renderApp } from '../../test/utils'

describe('Version footer', () => {
  it('shows the API revision reported by the health check', async () => {
    vi.mocked(healthApi.live).mockResolvedValue({
      status: 'ok',
      revision: '0482313dbbad2587c75e27eca268f3a69d5acbae',
    })
    renderApp(routes.notFound)

    expect(
      await screen.findByText(
        t('version.summary', {
          web: t('version.development'),
          api: '0482313',
        }),
      ),
    ).toBeInTheDocument()
  })

  it('says when the API cannot be reached', async () => {
    vi.mocked(healthApi.live).mockRejectedValue(new Error('offline'))
    renderApp(routes.notFound)

    expect(
      await screen.findByText(
        t('version.summary', {
          web: t('version.development'),
          api: t('version.unavailable'),
        }),
      ),
    ).toBeInTheDocument()
  })
})
