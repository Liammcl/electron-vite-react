import { Suspense } from 'react'
import { useLocation, Navigate } from 'react-router-dom'

// 路由守卫组件
export const RouterGuard = ({ element: Element, meta }) => {
  const location = useLocation()
  
//   const isAuthenticated = localStorage.getItem('token') // 这里根据你的实际登录态判断逻辑修改
  
  // 设置页面标题
  if (meta?.title) {
    document.title = meta.title
  }

//   if (meta?.requiresAuth && !isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />
//   }

  // 使用 Suspense 包裹懒加载组件
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Element />
    </Suspense>
  )
} 