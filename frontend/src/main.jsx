import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './estilos/efectos.css'
import './estilos/estados.css'
import { iniciarEfectos } from './efectos'
import { Provider } from 'react-redux'
import store from './store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos el App en el Provider de redux */}
    <Provider store={store}>    
      <App />    
    </Provider>
  </React.StrictMode>,
)

iniciarEfectos()

// PWA: registra el service worker que hace instalable la app (solo en producción).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
