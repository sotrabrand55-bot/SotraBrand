import 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx'
import { StrictMode } from 'react'
import axios from 'axios'
import { useMockData } from './lib/mockData.js'

axios.defaults.withCredentials = true

if (useMockData) {
  axios.interceptors.request.use((config) => {
    const url = String(config.url || '')
    if (url.includes('/api/')) {
      return Promise.reject(new axios.CanceledError('Mock data is enabled'))
    }
    return config
  })

  const nativeFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input?.url || ''

    if (String(url).includes('/api/')) {
      return Promise.reject(new DOMException('Mock data is enabled', 'AbortError'))
    }

    return nativeFetch(input, init)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter> {/*druri ta ekhod support bel app jsx mn browserrouter*/}
  <ShopContextProvider>  {/*we well get supported from shop context provider*/}
         <App/>               
  </ShopContextProvider>
  </BrowserRouter>
  </StrictMode>
)
