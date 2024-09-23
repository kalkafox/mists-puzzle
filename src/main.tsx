import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.tsx'
import './index.css'
import { Provider } from 'jotai'
import { store } from './lib/atom.ts'
import { ThemeProvider } from './components/theme-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
