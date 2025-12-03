import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Force light mode on initialization - override any saved preferences
if (typeof window !== 'undefined') {
  const root = document.documentElement
  root.classList.remove('dark')
  root.classList.add('light')
  root.setAttribute('data-theme', 'light')
  // Clear any saved dark theme preference
  const savedTheme = localStorage.getItem('nikah-alpha-theme')
  if (savedTheme === 'dark') {
    localStorage.setItem('nikah-alpha-theme', 'light')
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
