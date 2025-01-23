import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.scss'

const isElectron = window?.electron !== undefined;
if (isElectron) {
  import('./demos/ipc');

}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
