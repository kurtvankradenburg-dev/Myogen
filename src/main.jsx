import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import { registerSW } from './sw-register'

registerSW()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomCursor />
    <App />
  </StrictMode>,
)
