import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { createQueryClient } from 'utils/queryClient'

// Renders the whole app (real routes, i18n, React Query) at the given path.
export const renderApp = (path) => {
  const queryClient = createQueryClient({ queries: { retry: false } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
