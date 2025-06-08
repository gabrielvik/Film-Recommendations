import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path: string
}

export const Breadcrumbs = () => {
  const location = useLocation()
  
  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Add home
    breadcrumbs.push({ label: 'Home', path: '/' })
    
    // Generate breadcrumbs for each path segment
    pathnames.forEach((segment, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`
      const label = formatLabel(segment)
      breadcrumbs.push({ label, path })
    })
    
    return breadcrumbs
  }

  const formatLabel = (segment: string): string => {
    // Handle special cases
    const specialCases: Record<string, string> = {
      'movies': 'Movies',
      'search': 'Search',
      'profile': 'Profile',
      'login': 'Login',
      'register': 'Register',
      '404': 'Not Found'
    }
    
    return specialCases[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  const breadcrumbs = generateBreadcrumbs()
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="hover:text-foreground transition-colors flex items-center"
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
