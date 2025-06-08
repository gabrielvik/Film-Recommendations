import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals'

/**
 * Performance monitoring utility for CinematIQ
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceData {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  timestamp: number
}

/**
 * Performance thresholds based on Google's Core Web Vitals
 */
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const

/**
 * Get performance rating based on metric value and thresholds
 */
function getPerformanceRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Format metric data for reporting
 */
function formatMetricData(metric: Metric): PerformanceData {
  return {
    name: metric.name,
    value: metric.value,
    rating: getPerformanceRating(
      metric.name as keyof typeof THRESHOLDS,
      metric.value
    ),
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
  }
}

/**
 * Send performance data to analytics (console.log for development)
 */
function sendToAnalytics(data: PerformanceData) {
  // In development, log to console
  if (import.meta.env.DEV) {
    console.group(`📊 Performance Metric: ${data.name}`)
    console.log(`Value: ${data.value.toFixed(2)}ms`)
    console.log(`Rating: ${data.rating}`)
    console.log(`Delta: ${data.delta.toFixed(2)}ms`)
    console.log(`ID: ${data.id}`)
    console.groupEnd()
  }

  // In production, send to your analytics service
  // Example: gtag('event', 'web_vitals', data)
  // Example: analytics.track('Web Vitals', data)
}

/**
 * Initialize Core Web Vitals monitoring
 */
export function initPerformanceMonitoring(): void {
  // Track Core Web Vitals
  getCLS(metric => sendToAnalytics(formatMetricData(metric)))
  getFID(metric => sendToAnalytics(formatMetricData(metric)))
  getFCP(metric => sendToAnalytics(formatMetricData(metric)))
  getLCP(metric => sendToAnalytics(formatMetricData(metric)))
  getTTFB(metric => sendToAnalytics(formatMetricData(metric)))

  // Log initialization
  if (import.meta.env.DEV) {
    console.log('🚀 Performance monitoring initialized')
  }
}

/**
 * Custom performance measurement utility
 */
export class PerformanceTracker {
  private measurements = new Map<string, number>()

  /**
   * Start measuring a custom metric
   */
  start(name: string): void {
    this.measurements.set(name, performance.now())
  }

  /**
   * End measuring and log the result
   */
  end(name: string): number {
    const startTime = this.measurements.get(name)
    if (!startTime) {
      console.warn(`Performance measurement '${name}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(name)

    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure an async operation
   */
  async measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.start(name)
    try {
      const result = await operation()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker()

/**
 * Memory usage tracking
 */
export function trackMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const data = {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    }

    if (import.meta.env.DEV) {
      console.log('💾 Memory Usage:', data)
    }
  }
}

/**
 * Network information tracking
 */
export function trackNetworkInfo(): void {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const data = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    }

    if (import.meta.env.DEV) {
      console.log('🌐 Network Info:', data)
    }
  }
}