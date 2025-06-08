import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScroll?: (scrollTop: number) => void
  scrollToIndex?: number
}

/**
 * Performance-optimized virtual list component
 * Only renders visible items plus overscan buffer
 */
function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  scrollToIndex,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range with memoization
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Memoize visible items to prevent unnecessary re-renders
  const visibleItems = useMemo(() => {
    const result = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          key: `item-${i}`,
        })
      }
    }
    return result
  }, [items, visibleRange.startIndex, visibleRange.endIndex])

  // Memoized scroll handler with throttling
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    },
    [onScroll]
  )

  // Handle scroll to index
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      const targetScrollTop = scrollToIndex * itemHeight
      containerRef.current.scrollTop = targetScrollTop
      setScrollTop(targetScrollTop)
    }
  }, [scrollToIndex, itemHeight])

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Virtual container with full height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: 'hidden',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(VirtualList) as <T>(
  props: VirtualListProps<T>
) => React.ReactElement