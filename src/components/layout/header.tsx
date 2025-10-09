import { Link } from 'react-router-dom'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import LangSwitcher from '@/components/ui/lang-switcher'
import { useTranslation } from 'react-i18next'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="w-full px-4 py-3 example">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <nav aria-label={t('main navigation', 'Main navigation')} className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            {t('nav.home', 'Home')}
          </Link>

          <Link
            to="/about"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            {t('nav.about', 'About')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">{t('theme')}：</span>
            <AnimatedThemeToggler />
          </div>

          <div className="flex items-center">
            <LangSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}