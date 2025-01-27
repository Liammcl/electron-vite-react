import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from '@/context/ThemeContext'
import LayoutContainer from '@/Layout'
import { RouterView } from '@/router/routerView'
import { RootStoreProvider } from '@/context/rootContext'
function App() {
  return (
    <BrowserRouter>
    <ThemeProvider>
    <RootStoreProvider>
      <LayoutContainer>
      <RouterView />
      </LayoutContainer>
      </RootStoreProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}

export default App