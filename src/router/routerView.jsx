import { Routes, Route } from 'react-router-dom'
import { routes } from './routes'
import { RouterGuard } from './RouterGuard'

import { useTransition, animated } from '@react-spring/web'
import { useLocation } from 'react-router-dom'
const AnimatedRoutes = ({ children }) => {
  const location = useLocation()
  const elasticSlide = useTransition(location, {
    from: { 
      opacity: 0,
      transform: 'translateX(100%) scale(0.8)',
    },
    enter: { 
      opacity: 1,
      transform: 'translateX(0%) scale(1)',
    },
    leave: { 
      opacity: 0,
      transform: 'translateX(-100%) scale(0.8)',
    },
  })
  // 3. 交错淡入淡出
  const crossFade = useTransition(location, {
    from: { 
      opacity: 0,
      transform: 'scale(1.1)',
      filter: 'blur(10px)',
    },
    enter: { 
      opacity: 1,
      transform: 'scale(1)',
      filter: 'blur(0px)',
    },
    leave: { 
      opacity: 0,
      transform: 'scale(0.9)',
      filter: 'blur(10px)',
    },
    config: { tension: 280, friction: 20 },
  })  
  const fold3D = useTransition(location, {
    from: { 
      opacity: 0,
      transform: 'perspective(2000px) rotateX(90deg)',
      transformOrigin: 'top',
    },
    enter: { 
      opacity: 1,
      transform: 'perspective(2000px) rotateX(0deg)',
    },
    leave: { 
      opacity: 0,
      transform: 'perspective(2000px) rotateX(-90deg)',
      transformOrigin: 'bottom',
    },
    config: { tension: 280, friction: 20 },
  })
const transitions=elasticSlide
  return transitions((props, item) => (
    <animated.div
      style={{
        ...props,
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'auto', // 添加这行
      }}
    >
      {children}
    </animated.div>
  ))
}

export const RouterView = () => {
  return (
    <AnimatedRoutes>
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
    </AnimatedRoutes>
  )
}