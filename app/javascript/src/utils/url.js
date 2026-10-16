// buildUrl('/sample-items/:id', { id: 5 }) => '/sample-items/5'
export const buildUrl = (route, params = {}) =>
  route.replace(/:(\w+)/g, (placeholder, key) =>
    key in params ? encodeURIComponent(params[key]) : placeholder,
  )
