import { describe, it, expect } from 'vitest'
import { render } from '@/test/utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('Button should not have accessibility violations', async () => {
    const { container } = render(<Button>Test Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Input should not have accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test Label</label>
        <Input id="test-input" placeholder="Test input" />
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Form should be accessible', async () => {
    const { container } = render(
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input id="password" type="password" />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
