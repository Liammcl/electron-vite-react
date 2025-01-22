import { lazy } from 'react'

// 使用懒加载导入组件
const Home = lazy(() => import('@/views/Home'))
const Nofound = lazy(() => import('@/views/404'))
export const routes = [
  {
    path: '/',
    element: Home,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '*',
    element: Nofound,
    meta: {
      title: '404',
      requiresAuth: false
    }
  }
] 