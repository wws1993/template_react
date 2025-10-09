
import { useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import '@/lib/i18n'
import store from '@/store'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import LangSwitcher from '@/components/ui/lang-switcher'
export function App() {
  const { t } = useTranslation()

  return <Provider store={store}>
    <div className="p-20 flex flex-col gap-5">

      <div>
        <label>{t('theme')}：</label>
        <AnimatedThemeToggler />
      </div>

      <div>
        <LangSwitcher />
      </div>

      <div className="mt-6 text-xl">{t('welcome')}</div>
    </div>
  </Provider>
}