import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import { Loading } from '@/components/ui'
import { ProtectedRoute } from './ProtectedRoute'
import { RootLayout } from '@/components/layout/RootLayout'

// Lazy load pages for code splitting
const SearchLandingPage = lazy(() => import('@/features/search/pages/SearchLandingPage'))
const MovieDetailsPage = lazy(() => import('@/features/movies/pages/MovieDetailsPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/features/common/pages/NotFoundPage'))

// Loading wrapper component
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Loading page..." />
      </div>
    }
  >
    {children}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWrapper>
        <SearchLandingPage />
      </PageWrapper>
    ),
    errorElement: (
      <PageWrapper>
        <NotFoundPage />
      </PageWrapper>
    ),
  },
  {
    path: '/movie/:id',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <PageWrapper>
            <MovieDetailsPage />
          </PageWrapper>
        ),
      },
    ],
  },
  {
    path: '/profile',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/404',
    element: (
      <PageWrapper>
        <NotFoundPage />
      </PageWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
])
