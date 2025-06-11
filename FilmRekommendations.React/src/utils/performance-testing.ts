import { performanceTracker } from './performance'

/**
 * Performance testing utilities for CinematIQ
 * Test and benchmark various application performance metrics
 */

interface PerformanceTestResult {
  name: string
  duration: number
  passed: boolean
  threshold: number
  details?: Record<string, any>
}

interface ComponentRenderTest {
  componentName: string
  renderCount: number
  averageRenderTime: number
  passed: boolean
}

/**
 * Test component render performance
 */
export function testComponentRender(
  componentName: string,
  renderFunction: () => void,
  iterations = 100,
  thresholdMs = 16 // 60fps threshold
): PerformanceTestResult {
  const times: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    renderFunction()
    const end = performance.now()
    times.push(end - start)
  }
  
  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
  const passed = averageTime <= thresholdMs
  
  if (import.meta.env.DEV) {
    console.log(`🧪 Component Render Test: ${componentName}`)
    console.log(`  Average render time: ${averageTime.toFixed(2)}ms`)
    console.log(`  Threshold: ${thresholdMs}ms`)
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
  }
  
  return {
    name: `${componentName} Render Performance`,
    duration: averageTime,
    passed,
    threshold: thresholdMs,
    details: {
      iterations,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      standardDeviation: Math.sqrt(
        times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length
      )
    }
  }
}

/**
 * Test bundle loading performance
 */
export async function testBundleLoading(): Promise<PerformanceTestResult> {
  const start = performance.now()
  
  // Test dynamic import performance
  try {
    await import('../features/movies/components/MovieCard')
    await import('../features/movies/components/FilterPanel')
    await import('../features/search/pages/SearchPage')
  } catch (error) {
    console.error('Bundle loading test failed:', error)
  }
  
  const end = performance.now()
  const duration = end - start
  const threshold = 1000 // 1 second threshold
  const passed = duration <= threshold
  
  if (import.meta.env.DEV) {
    console.log(`📦 Bundle Loading Test`)
    console.log(`  Load time: ${duration.toFixed(2)}ms`)
    console.log(`  Threshold: ${threshold}ms`)
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
  }
  
  return {
    name: 'Bundle Loading Performance',
    duration,
    passed,
    threshold
  }
}

/**
 * Test API response performance
 */
export async function testAPIPerformance(
  apiCall: () => Promise<any>,
  testName: string,
  thresholdMs = 3000
): Promise<PerformanceTestResult> {
  const start = performance.now()
  
  try {
    await apiCall()
  } catch (error) {
    console.error(`API test failed for ${testName}:`, error)
  }
  
  const end = performance.now()
  const duration = end - start
  const passed = duration <= thresholdMs
  
  if (import.meta.env.DEV) {
    console.log(`🌐 API Performance Test: ${testName}`)
    console.log(`  Response time: ${duration.toFixed(2)}ms`)
    console.log(`  Threshold: ${thresholdMs}ms`)
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
  }
  
  return {
    name: `${testName} API Performance`,
    duration,
    passed,
    threshold: thresholdMs
  }
}

/**
 * Test memory usage over time
 */
export function testMemoryUsage(durationMs = 30000): Promise<PerformanceTestResult> {
  return new Promise((resolve) => {
    const measurements: number[] = []
    const interval = 1000 // Measure every second
    let elapsed = 0
    
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        measurements.push(memory.usedJSHeapSize)
      }
      
      elapsed += interval
      
      if (elapsed >= durationMs) {
        clearInterval(timer)
        
        const averageMemory = measurements.reduce((sum, mem) => sum + mem, 0) / measurements.length
        const maxMemory = Math.max(...measurements)
        const memoryGrowth = measurements[measurements.length - 1] - measurements[0]
        
        // Memory growth threshold: 50MB
        const threshold = 50 * 1024 * 1024
        const passed = memoryGrowth <= threshold
        
        if (import.meta.env.DEV) {
          console.log(`💾 Memory Usage Test`)
          console.log(`  Average memory: ${(averageMemory / 1024 / 1024).toFixed(2)}MB`)
          console.log(`  Max memory: ${(maxMemory / 1024 / 1024).toFixed(2)}MB`)
          console.log(`  Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`)
          console.log(`  Threshold: ${threshold / 1024 / 1024}MB growth`)
          console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
        }
        
        resolve({
          name: 'Memory Usage Test',
          duration: memoryGrowth,
          passed,
          threshold,
          details: {
            averageMemory: averageMemory / 1024 / 1024,
            maxMemory: maxMemory / 1024 / 1024,
            measurements: measurements.length
          }
        })
      }
    }
    
    const timer = setInterval(measureMemory, interval)
    measureMemory() // Initial measurement
  })
}

/**
 * Run comprehensive performance test suite
 */
export async function runPerformanceTestSuite(): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []
  
  console.log('🚀 Starting CinematIQ Performance Test Suite')
  console.log('=' .repeat(50))
  
  // Test bundle loading
  results.push(await testBundleLoading())
  
  // Test memory usage (shorter duration for testing)
  results.push(await testMemoryUsage(10000))
  
  // Calculate overall score
  const passedTests = results.filter(result => result.passed).length
  const totalTests = results.length
  const scorePercentage = (passedTests / totalTests) * 100
  
  console.log('
📊 Performance Test Results Summary')
  console.log('=' .repeat(50))
  console.log(`Tests passed: ${passedTests}/${totalTests} (${scorePercentage.toFixed(1)}%)`)
  
  if (scorePercentage >= 80) {
    console.log('✅ Overall performance: EXCELLENT')
  } else if (scorePercentage >= 60) {
    console.log('⚠️ Overall performance: GOOD')
  } else {
    console.log('❌ Overall performance: NEEDS IMPROVEMENT')
  }
  
  return results
}

/**
 * Measure First Contentful Paint (FCP)
 */
export function measureFCP(): Promise<number> {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      
      if (fcpEntry) {
        resolve(fcpEntry.startTime)
        observer.disconnect()
      }
    })
    
    observer.observe({ entryTypes: ['paint'] })
  })
}

/**
 * Measure Largest Contentful Paint (LCP)
 */
export function measureLCP(): Promise<number> {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      if (lastEntry) {
        resolve(lastEntry.startTime)
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    
    // Timeout after 10 seconds
    setTimeout(() => {
      observer.disconnect()
      resolve(0)
    }, 10000)
  })
}