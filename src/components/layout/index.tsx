
import { useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import store from '@/store'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Outlet } from 'react-router-dom'

export function Layout() {
  const { t } = useTranslation()

  return <Provider store={store}>
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
        {/* fallback for non-routed rendering */}
        <div className="mt-6 text-center text-xl">{t('welcome')}</div>
      </main>

      <Footer />
    </div>
  </Provider>
}