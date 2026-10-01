import type { LessonProgress, ProgressMap, ProgressStore } from '~/types/progress'

const STORAGE_KEY = 'airobyte:progress:v1'

function read(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as ProgressMap : {}
  } catch {
    return {}
  }
}

/** Guest progress, stored in this browser only. */
export function createLocalProgressStore(): ProgressStore {
  return {
    async load() {
      return read()
    },
    async save(entry: LessonProgress) {
      const all = read()
      all[entry.lessonId] = entry
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
      } catch {
        // Private mode or storage full: progress stays in memory for this visit
      }
    },
    subscribe(onChange) {
      const handler = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) onChange(read())
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    }
  }
}

/**
 * Example for later, once authentication exists:
 *
 * export function createApiProgressStore(): ProgressStore {
 *   return {
 *     load: () => $fetch<ProgressMap>('/api/me/progress'),
 *     save: entry => $fetch(`/api/me/progress`, { method: 'PUT', body: entry })
 *   }
 * }
 *
 * On first sign-in, read the local store and PUT its entries to the API
 * so guest progress is not lost.
 */

/** Reads the unsynced local data, e.g. to upload it after the user signs in. */
export function readLocalProgress(): ProgressMap {
  return import.meta.client ? read() : {}
}
