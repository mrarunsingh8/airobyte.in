import type { LessonProgress, ProgressMap, ProgressStore } from '~/types/progress'

let store: ProgressStore | undefined
let loading: Promise<void> | undefined

function getStore(): ProgressStore {
  // Later: return a user's API store when signed in, e.g.
  // const { loggedIn } = useUserSession()
  // return loggedIn.value ? createApiProgressStore() : createLocalProgressStore()
  store ??= createLocalProgressStore()
  return store
}

function empty(lessonId: string, courseId: string): LessonProgress {
  return {
    lessonId,
    courseId,
    completed: false,
    completedAt: null,
    favourite: false,
    favouritedAt: null,
    updatedAt: new Date().toISOString()
  }
}

/** Course slug from a public lesson URL: /learn/<course>/<lesson> */
export function courseIdFromLesson(lessonId: string): string {
  return lessonId.split('/').filter(Boolean)[1] ?? ''
}

/**
 * Lesson progress shared across the whole app.
 * Loads once on the client; the server always renders the "not completed" state.
 */
export function useProgress() {
  const entries = useState<ProgressMap>('progress', () => ({}))
  const loaded = useState('progress-loaded', () => false)

  if (import.meta.client && !loading) {
    loading = getStore().load().then((all) => {
      entries.value = all
      loaded.value = true
      getStore().subscribe?.((next) => {
        entries.value = next
      })
    })
  }

  function get(lessonId: string) {
    return entries.value[lessonId]
  }

  async function update(lessonId: string, patch: Partial<LessonProgress>) {
    const now = new Date().toISOString()
    const next: LessonProgress = {
      ...(get(lessonId) ?? empty(lessonId, courseIdFromLesson(lessonId))),
      ...patch,
      updatedAt: now
    }
    const previous = get(lessonId)
    entries.value = { ...entries.value, [lessonId]: next } // optimistic
    try {
      await getStore().save(next)
    } catch (error) {
      // Roll back if the (future) API rejects the change
      const rest = { ...entries.value }
      if (previous) rest[lessonId] = previous
      else delete rest[lessonId]
      entries.value = rest
      throw error
    }
  }

  const isCompleted = (lessonId: string) => !!get(lessonId)?.completed
  const isFavourite = (lessonId: string) => !!get(lessonId)?.favourite

  const setCompleted = (lessonId: string, completed: boolean) =>
    update(lessonId, { completed, completedAt: completed ? new Date().toISOString() : null })

  const setFavourite = (lessonId: string, favourite: boolean) =>
    update(lessonId, { favourite, favouritedAt: favourite ? new Date().toISOString() : null })

  /** All progress entries for one course */
  const forCourse = (courseId: string) =>
    Object.values(entries.value).filter(entry => entry.courseId === courseId)

  const favourites = computed(() =>
    Object.values(entries.value)
      .filter(entry => entry.favourite)
      .sort((a, b) => (b.favouritedAt ?? '').localeCompare(a.favouritedAt ?? ''))
  )

  return {
    entries: readonly(entries),
    loaded: readonly(loaded),
    isCompleted,
    isFavourite,
    setCompleted,
    setFavourite,
    forCourse,
    favourites
  }
}
