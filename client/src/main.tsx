import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import { useTheme } from './hooks/useTheme'
import { ThemeToggleProvider } from './components/ThemeToggleProvider'
import { ToasterProvider } from './components/Toaster'
import './lib/theme.css'

function App() {
  const { appearance, toggle } = useTheme()
  return (
    <Theme
      appearance={appearance}
      accentColor="iris"
      grayColor="gray"
      radius="small"
      scaling="100%"
    >
      <ThemeToggleProvider value={{ appearance, toggle }}>
        <ToasterProvider>
          <RouterProvider router={router} />
        </ToasterProvider>
      </ThemeToggleProvider>
    </Theme>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
