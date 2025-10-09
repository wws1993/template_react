import { useTranslation } from 'react-i18next'

export function Home() {
  const { t } = useTranslation()
  return <div className="p-6">
    <h1 className="text-2xl font-bold">{t('home.title', 'Home')}</h1>
    <p className="mt-4">{t('home.desc', 'This is the home page.')}</p>
  </div>
}
