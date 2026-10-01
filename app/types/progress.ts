/**
 * Progress for a single lesson, for a single user.
 * Keep this shape the same when the API arrives so the UI never changes.
 */
export interface LessonProgress {
  /** Public lesson URL, e.g. /learn/javascript/variables (unique across the site) */
  lessonId: string
  /** Course slug, e.g. javascript (lets the API/UI query progress per course) */
  courseId: string
  completed: boolean
  completedAt: string | null
  favourite: boolean
  favouritedAt: string | null
  updatedAt: string
}

export type ProgressMap = Record<string, LessonProgress>

/**
 * Where progress is kept. Today: the browser. Later: your API, per signed-in user.
 * Swap the implementation in useProgress() and nothing else needs to change.
 */
export interface ProgressStore {
  /** Load everything for the current user (or guest) */
  load(): Promise<ProgressMap>
  /** Create or update one lesson */
  save(entry: LessonProgress): Promise<void>
  /** Optional: be told when progress changes elsewhere (another tab, another device) */
  subscribe?(onChange: (all: ProgressMap) => void): () => void
}
