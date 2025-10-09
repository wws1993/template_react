import { createRoot } from 'react-dom/client'
import AppRoutes from '@/lib/routes'
import '@/lib/i18n'
import '@/index.css'

createRoot(document.getElementById('root')!).render(<AppRoutes />)
