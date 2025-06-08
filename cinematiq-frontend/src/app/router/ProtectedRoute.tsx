import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Loading } from '@/components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate 
        to="/404" 
        replace 
      />
    )
  }

  return <>{children}</>
}
