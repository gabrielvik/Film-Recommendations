import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency, getImageUrl } from '@/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-03-15'
      const result = formatDate(date)
      expect(result).toBe('March 15, 2024')
    })

    it('should handle invalid date', () => {
      const invalidDate = 'invalid-date'
      const result = formatDate(invalidDate)
      expect(result).toBe('Unknown')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      const amount = 1234567
      const result = formatCurrency(amount)
      expect(result).toBe('$1,234,567')
    })

    it('should format currency with smaller amount', () => {
      const amount = 1000
      const result = formatCurrency(amount)
      expect(result).toBe('$1,000')
    })
  })

  describe('getImageUrl', () => {
    it('should return full TMDB image URL', () => {
      const path = '/example.jpg'
      const size = 'w500'
      const result = getImageUrl(path, size)
      expect(result).toBe('https://image.tmdb.org/t/p/w500/example.jpg')
    })

    it('should return null for null path', () => {
      const result = getImageUrl(null)
      expect(result).toBe(null)
    })
  })
})
