import type { Ref } from 'vue'

/** Shared between <Quiz> and its <QuizQuestion> children */
export interface QuizContext {
  /** Called once by each question; returns its position (0, 1, 2, ...) */
  register: () => number
  current: Readonly<Ref<number>>
  started: Readonly<Ref<boolean>>
  /** Goes up on every start / retry, so questions can reset themselves */
  attempt: Readonly<Ref<number>>
  total: Readonly<Ref<number>>
  answer: (index: number, correct: boolean) => void
  next: () => void
}
