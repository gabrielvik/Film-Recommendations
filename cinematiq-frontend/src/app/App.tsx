import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/components/ui'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { router } from '@/app/router'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="cinematiq-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
