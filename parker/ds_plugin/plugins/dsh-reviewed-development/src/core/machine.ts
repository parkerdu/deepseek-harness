import type { WorkflowState } from './types.ts'

export type WorkflowAction =
  | 'clarification_answer'
  | 'confirm_requirements'
  | 'revise_requirements'
  | 'approve_review'
  | 'cancel'
  | 'test_failed'
  | 'accept_product'
  | 'reject_product'
  | 'resume'
  | 'start_review'
  | 'start_implementation'
  | 'start_testing'
  | 'start_product_acceptance'
  | 'start_pr'
  | 'finish_pr'

const transitions: Record<WorkflowState, Partial<Record<WorkflowAction, WorkflowState>>> = {
  planning: { clarification_answer: 'drafting_requirements', confirm_requirements: 'reviewing_requirements', start_review: 'reviewing_requirements', cancel: 'cancelled' },
  drafting_requirements: { confirm_requirements: 'reviewing_requirements', clarification_answer: 'awaiting_requirements_confirmation', revise_requirements: 'planning', cancel: 'cancelled' },
  clarifying_requirements: { clarification_answer: 'awaiting_requirements_confirmation', cancel: 'cancelled' },
  awaiting_requirements_confirmation: { confirm_requirements: 'reviewing_requirements', revise_requirements: 'planning', cancel: 'cancelled' },
  reviewing_requirements: { start_review: 'awaiting_review_decision', approve_review: 'implementing_and_authoring_tests', revise_requirements: 'planning', cancel: 'cancelled' },
  awaiting_review_decision: { approve_review: 'implementing_and_authoring_tests', revise_requirements: 'planning', cancel: 'cancelled' },
  implementing_and_authoring_tests: { start_testing: 'testing', cancel: 'cancelled', resume: 'implementing_and_authoring_tests' },
  testing: { start_product_acceptance: 'awaiting_product_acceptance', test_failed: 'implementing_and_authoring_tests', cancel: 'cancelled' },
  awaiting_product_acceptance: { accept_product: 'awaiting_user_acceptance', reject_product: 'implementing_and_authoring_tests', cancel: 'cancelled' },
  awaiting_user_acceptance: { accept_product: 'creating_pr', reject_product: 'implementing_and_authoring_tests', cancel: 'cancelled' },
  creating_pr: { finish_pr: 'completed', resume: 'creating_pr', cancel: 'cancelled' },
  completed: {},
  cancelled: {},
  failed: { resume: 'planning', cancel: 'cancelled' },
  paused_no_progress: { resume: 'implementing_and_authoring_tests', cancel: 'cancelled' },
  pr_failed: { resume: 'creating_pr', cancel: 'cancelled' },
}

export function transition(state: WorkflowState, action: WorkflowAction): WorkflowState {
  const next = transitions[state][action]
  if (next === undefined) throw new Error(`invalid workflow transition: ${state} + ${action}`)
  return next
}

export function canTransition(state: WorkflowState, action: WorkflowAction): boolean {
  return transitions[state][action] !== undefined
}

export function assertState(state: WorkflowState, expected: WorkflowState): void {
  if (state !== expected) throw new Error(`expected workflow state ${expected}, got ${state}`)
}
