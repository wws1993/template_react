import { createRoot } from 'react-dom/client'
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import './index.css'

createRoot(document.getElementById('root')!).render(<div className='p-20 flex flex-col gap-5'>
  <div>
    <label>主题切换：</label>
    <AnimatedThemeToggler />
  </div>

</div>)
