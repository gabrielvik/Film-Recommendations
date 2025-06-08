# Testing Infrastructure Documentation

## Overview

CinematIQ uses a comprehensive testing infrastructure with modern tools and best practices:

- **Unit & Integration Testing**: Vitest with React Testing Library
- **End-to-End Testing**: Playwright
- **Accessibility Testing**: jest-axe and axe-playwright
- **Coverage Reporting**: V8 with HTML reports
- **Test Environment**: happy-dom for fast DOM simulation

## Quick Start

### Install Dependencies
```bash
npm install
npm run test:install  # Install Playwright browsers
```

### Run Tests
```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npm run test:run

# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# All tests
npm run test:all
```

## Testing Stack

### Core Technologies
- **Vitest**: Fast unit test runner with Jest-compatible APIs
- **React Testing Library**: Component testing utilities
- **Playwright**: Cross-browser E2E testing
- **happy-dom**: Lightweight DOM implementation
- **jest-axe**: Accessibility testing for components
- **axe-playwright**: Accessibility testing for E2E

### Test Types

#### Unit Tests (`*.test.{ts,tsx}`)
- Test individual functions and components
- Located alongside source files
- Use React Testing Library for component tests
- Mock external dependencies

#### Integration Tests
- Test component interactions
- Use custom render utilities with providers
- Test React Query hooks and API integrations

#### E2E Tests (`e2e/*.spec.ts`)
- Test complete user workflows
- Run in real browsers (Chromium, Firefox, WebKit)
- Include accessibility testing
- Mobile and desktop viewports

#### Accessibility Tests
- Automated WCAG 2.1 AA compliance testing
- Component-level with jest-axe
- Page-level with axe-playwright

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

### Playwright Configuration (`playwright.config.ts`)
- Tests run against `http://localhost:3000`
- Automatic development server startup
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Screenshot and video capture on failure

## Writing Tests

### Component Tests
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render and handle clicks', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should be accessible', async ({ page }) => {
  await page.goto('/')
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
```

### Accessibility Tests
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Test Button</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Test Utilities

### Custom Render (`src/test/utils.tsx`)
Provides components with necessary providers:
- React Router (BrowserRouter)
- React Query (QueryClient)
- Authentication (AuthProvider)

```typescript
import { render } from '@/test/utils'

// Automatically wraps with providers
render(<MyComponent />)
```

### Mock Setup (`src/test/setup.ts`)
- Configures test environment
- Sets up global mocks (IntersectionObserver, ResizeObserver)
- Configures jest-dom matchers

## Coverage Requirements

Current coverage thresholds (80% minimum):
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

Coverage reports are generated in:
- **Console**: Text summary
- **HTML**: `coverage/index.html`
- **JSON**: `coverage/coverage.json`

## Best Practices

### Component Testing
1. **Test behavior, not implementation**
2. **Use accessibility queries** (`getByRole`, `getByLabelText`)
3. **Test user interactions** with `userEvent`
4. **Mock external dependencies** (APIs, localStorage)
5. **Test error states** and loading states

### E2E Testing
1. **Test critical user journeys**
2. **Use data-testid sparingly** (prefer semantic queries)
3. **Test on multiple browsers** and viewports
4. **Include accessibility checks**
5. **Keep tests independent** and idempotent

### Accessibility Testing
1. **Test with keyboard navigation**
2. **Verify ARIA attributes**
3. **Check color contrast**
4. **Test screen reader compatibility**
5. **Validate semantic HTML structure**

## Debugging Tests

### Vitest
```bash
# Run specific test file
npm run test utils.test.ts

# Run in debug mode with UI
npm run test:ui

# Watch mode for development
npm run test:watch
```

### Playwright
```bash
# Run with browser UI
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Debug specific test
npx playwright test --debug app.spec.ts
```

## Continuous Integration

The testing infrastructure is designed for CI/CD:
- **Fast execution**: Vitest runs tests in parallel
- **Reliable**: Uses deterministic test environment
- **Cross-platform**: Works on Windows, macOS, Linux
- **Docker-ready**: Playwright supports containerized testing

### CI Configuration
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run unit tests
  run: npm run test:run

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Performance

### Optimization Features
- **Parallel execution**: Tests run concurrently
- **Smart caching**: Vitest caches test results
- **Fast DOM**: happy-dom is 2-3x faster than jsdom
- **Code splitting**: Tests are isolated and optimized
- **Watch mode**: Only re-runs affected tests

### Benchmarks
- **Unit tests**: ~1.5s for 15 tests
- **Coverage generation**: ~2.5s
- **E2E tests**: ~10-30s depending on complexity

## Troubleshooting

### Common Issues

**"Module not found" errors**
- Check TypeScript path mapping in `vitest.config.ts`
- Ensure `@` alias is configured correctly

**"Cannot find element" in tests**
- Use `screen.debug()` to see rendered output
- Check component is properly wrapped with providers

**Playwright browser errors**
- Run `npm run test:install` to install browsers
- Check firewall/proxy settings

**Coverage thresholds not met**
- Add more tests for uncovered lines
- Check coverage report: `npm run test:coverage`

### Getting Help

1. **Check test output**: Read error messages carefully
2. **Use debugging tools**: `screen.debug()`, Playwright inspector
3. **Review documentation**: Testing Library, Playwright guides
4. **Run in isolation**: Test individual files/functions
5. **Check browser console**: For E2E test issues

---

## Summary

The CinematIQ testing infrastructure provides:
✅ **Fast unit testing** with Vitest and RTL  
✅ **Comprehensive E2E testing** with Playwright  
✅ **Accessibility compliance** testing  
✅ **Code coverage** reporting with thresholds  
✅ **Modern tooling** with excellent DX  
✅ **CI/CD ready** configuration  

This ensures high code quality, prevents regressions, and maintains accessibility standards throughout development.
