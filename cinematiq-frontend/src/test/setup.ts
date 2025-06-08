import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver for tests
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {
      return null
    }
    disconnect() {
      return null
    }
    unobserve() {
      return null
    }
  }

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {
      return null
    }
    disconnect() {
      return null
    }
    unobserve() {
      return null
    }
  }

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })
})
