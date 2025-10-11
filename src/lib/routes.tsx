import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';

// 使用 React.lazy 实现路由懒加载，并包装命名导出为默认导出
const Home = lazy(() => import('@/components/pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('@/components/pages/About').then(module => ({ default: module.About })));
const Demo_3D = lazy(() => import('@/components/pages/Demo_3D').then(module => ({ default: module.Demo_3D })));
const Demo_particles = lazy(() => import('@/components/pages/Demo_particles').then(module => ({ default: module.Demo_particles })));

export default function AppRoutes() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route path="/demo/3d" element={<Demo_3D />} />
      <Route path="/demo/particles" element={<Demo_particles />} />
      <Route path="*" element={<div>404</div>} />
    </Routes>
  </BrowserRouter>
}
