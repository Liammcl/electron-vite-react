import { Routes, Route } from 'react-router-dom'
import { routes } from './routes'
import { RouterGuard } from './RouterGuard'

export const RouterView = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouterGuard
              element={route.element}
              meta={route.meta}
            />
          }
        />
      ))}
    </Routes>
  )
}