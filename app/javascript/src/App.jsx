import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router'
import VersionFooter from 'components/commons/VersionFooter'
import NotFound from 'components/NotFound'
import SampleItems from 'components/SampleItems'
import ShowSampleItem from 'components/SampleItems/Show'
import { routes } from 'routes'

const App = () => {
  const { t } = useTranslation()

  return (
    <>
      <title>{t('app.title')}</title>
      <Routes>
        <Route
          path={routes.root}
          element={<Navigate to={routes.sampleItems.index} replace />}
        />
        <Route path={routes.sampleItems.index} element={<SampleItems />} />
        <Route path={routes.sampleItems.show} element={<ShowSampleItem />} />
        <Route path={routes.notFound} element={<NotFound />} />
      </Routes>
      <VersionFooter />
    </>
  )
}

export default App
