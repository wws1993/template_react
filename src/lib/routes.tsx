import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Home } from '@/components/pages/Home'
import { About } from '@/components/pages/About'

export default function AppRoutes() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  </BrowserRouter>
}
