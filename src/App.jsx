import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from '@/context/ThemeContext'
import LayoutContainer from '@/Layout'
import { RouterView } from '@/router/routerView'

function App() {
  return (
    <BrowserRouter>
    <ThemeProvider>
      <LayoutContainer>
      <RouterView />
      </LayoutContainer>
    </ThemeProvider>
    </BrowserRouter>
  );
}

export default App