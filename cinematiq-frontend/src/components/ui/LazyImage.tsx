import React, { memo, useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
  placeholder?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
  threshold?: number
  rootMargin?: string
}

/**
 * Enhanced lazy loading image component with intersection observer
 * Optimized for performance with React.memo and proper cleanup
 */
const LazyImage = memo<LazyImageProps>(function LazyImage({
  src,
  alt,
  className,
  fallback = '/placeholder-movie.jpg',
  placeholder,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Memoized intersection observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setImageSrc(src)
        if (observerRef.current && imageRef) {
          observerRef.current.unobserve(imageRef)
        }
      }
    },
    [src, imageRef]
  )

  // Memoized image load handler
  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  // Memoized image error handler
  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    setImageSrc(fallback)
    onError?.()
  }, [fallback, onError])

  // Memoized ref callback for intersection observer
  const imageRefCallback = useCallback(
    (node: HTMLImageElement | null) => {
      if (imageRef) {
        observerRef.current?.unobserve(imageRef)
      }

      setImageRef(node)

      if (node) {
        observerRef.current = new IntersectionObserver(handleIntersection, {
          threshold,
          rootMargin,
        })
        observerRef.current.observe(node)
      }
    },
    [handleIntersection, threshold, rootMargin, imageRef]
  )

  // Cleanup observer on unmount
  useEffect(() => {
    const observer = observerRef.current
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  // Early return for placeholder while not intersecting
  if (!imageSrc) {
    return (
      <div
        ref={imageRefCallback}
        className={cn(
          'bg-gray-800 animate-pulse flex items-center justify-center',
          className
        )}
        aria-label={`Loading ${alt}`}
      >
        {placeholder || (
          <div className="text-gray-600 text-sm">Loading...</div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center',
            className
          )}
          aria-label={`Loading ${alt}`}
        >
          {placeholder || (
            <div className="text-gray-600 text-sm">Loading...</div>
          )}
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imageRefCallback}
        src={hasError ? fallback : imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
})

export default LazyImage