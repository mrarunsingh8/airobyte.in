import type { ContentNavigationItem } from '@nuxt/content'

/**
 * Content keeps sections as folders for sidebar grouping:
 *   content/learn/<course>/<section>/<lesson>.md  →  content path /learn/<course>/<section>/<lesson>
 * Public URLs drop the section folders:
 *   /learn/<course>/<lesson>
 *
 * Lesson slugs must therefore be unique within a course.
 */
export function toPublicPath(path: string): string {
  const [pathname = '', hash] = path.split('#')
  const parts = pathname.split('/').filter(Boolean)

  if (parts[0] !== 'learn' || parts.length <= 3) {
    return path
  }

  const publicPath = `/${parts[0]}/${parts[1]}/${parts[parts.length - 1]}`
  return hash === undefined ? publicPath : `${publicPath}#${hash}`
}

/** Returns a copy of a navigation tree with every path converted to its public URL. */
export function toPublicNavigation(items: ContentNavigationItem[] = []): ContentNavigationItem[] {
  return items.map(item => ({
    ...item,
    path: toPublicPath(item.path),
    ...(item.children && { children: toPublicNavigation(item.children) })
  }))
}
