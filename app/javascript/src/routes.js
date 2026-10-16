// Every page path and API endpoint lives here. Never hard-code a path elsewhere;
// build concrete URLs with buildUrl from utils/url.

export const routes = {
  root: '/',
  sampleItems: {
    index: '/sample-items',
    show: '/sample-items/:id',
  },
  notFound: '*',
}

export const apiRoutes = {
  health: {
    live: '/api/health/live',
  },
  sampleItems: {
    index: '/api/sample_items',
    show: '/api/sample_items/:id',
  },
}
