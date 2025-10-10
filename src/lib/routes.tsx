import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';

// 使用 React.lazy 实现路由懒加载，并包装命名导出为默认导出
const Home = lazy(() => import('@/components/pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('@/components/pages/About').then(module => ({ default: module.About })));

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
