export interface TestCase { id: number; type: string; prompt: string; }

export const EVAL_DATASET: TestCase[] = [
  { id: 1, type: 'clean', prompt: 'Build a CRM with login, contacts, dashboard, role-based access, and premium plan payments.' },
  { id: 2, type: 'vague', prompt: 'Build an elegant and fast application similar to Twitter but with better custom themes.' },
  { id: 3, type: 'conflicting', prompt: 'Create a fully anonymous real-time chat app that enforces strict financial KYC identity verification on signup.' }
];