import { useTranslation } from 'react-i18next'

export function About() {
  const { t } = useTranslation()
  return <div className="p-6">
    <h1 className="text-2xl font-bold">{t('about.title', 'About')}</h1>
    <p className="mt-4">{t('about.desc', 'This is the about page.')}</p>
  </div>
}
