import { describe, expect, it } from 'vitest'
import { canTransition, transition } from '../src/core/machine.ts'

describe('reviewed development state machine', () => {
  it('allows only the product-confirmed path into review', () => {
    expect(transition('awaiting_requirements_confirmation', 'confirm_requirements')).toBe('reviewing_requirements')
    expect(transition('reviewing_requirements', 'approve_review')).toBe('implementing_and_authoring_tests')
    expect(transition('testing', 'start_product_acceptance')).toBe('awaiting_product_acceptance')
    expect(transition('awaiting_user_acceptance', 'accept_product')).toBe('creating_pr')
  })

  it('rejects bypassing review, testing, or user acceptance', () => {
    expect(canTransition('awaiting_requirements_confirmation', 'approve_review')).toBe(false)
    expect(canTransition('implementing_and_authoring_tests', 'accept_product')).toBe(false)
    expect(canTransition('testing', 'accept_product')).toBe(false)
    expect(() => transition('testing', 'accept_product')).toThrow(/invalid workflow transition/)
  })
})
