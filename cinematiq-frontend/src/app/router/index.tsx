import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import { RootLayout } from '@/components/layout/RootLayout'
import { Loading } from '@/components/ui'
import { ProtectedRoute } from './ProtectedRoute'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'))
const MoviesPage = lazy(() => import('@/features/movies/pages/MoviesPage'))
const DiscoverPage = lazy(() => import('@/features/movies/pages/DiscoverPage'))
const MovieDetailsPage = lazy(() => import('@/features/movies/pages/MovieDetailsPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
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
    element: <RootLayout />,
    errorElement: (
      <PageWrapper>
        <NotFoundPage />
      </PageWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        ),
      },
      {
        path: 'search',
        element: (
          <PageWrapper>
            <SearchPage />
          </PageWrapper>
        ),
      },
      {
        path: 'movies',
        element: (
          <PageWrapper>
            <MoviesPage />
          </PageWrapper>
        ),
      },
      {
        path: 'discover',
        element: (
          <PageWrapper>
            <DiscoverPage />
          </PageWrapper>
        ),
      },
      {
        path: 'movie/:id',
        element: (
          <PageWrapper>
            <MovieDetailsPage />
          </PageWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <PageWrapper>
            <RegisterPage />
          </PageWrapper>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PageWrapper>
            <ForgotPasswordPage />
          </PageWrapper>
        ),
      },
      {
        path: '404',
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
    ],
  },
])
