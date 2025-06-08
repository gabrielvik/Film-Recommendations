import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/components/ui'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { router } from '@/app/router'

function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="cinematiq-ui-theme">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

export default App
