<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * Snake-style course roadmap. Registered globally, so it works in markdown:
 *
 *   ::roadmap                         -> auto-built from the current course's sections & lessons
 *   ::roadmap{step-label="Month"}
 *   ::
 *
 * or with hand-written phases in a YAML block:
 *   ::roadmap
 *   ---
 *   phases:
 *     - title: Basics
 *       icon: i-lucide-sprout
 *       milestone: Build a small app
 *       topics:
 *         - title: Variables
 *           to: /learn/javascript/variables
 *   ---
 *   ::
 */
export interface RoadmapTopic {
  title: string
  to?: string
  done?: boolean
}

export interface RoadmapPhase {
  title: string
  description?: string
  icon?: string
  topics: RoadmapTopic[]
  milestone?: string
}

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  phases?: RoadmapPhase[]
  /** Prefix shown before the phase number, e.g. "Phase", "Month", "Week" */
  stepLabel?: string
  /** Lessons shown before "Show all" on collapsed phases */
  preview?: number
  /** Lesson slugs to leave out when auto-building */
  exclude?: string[]
}>(), {
  title: undefined,
  description: undefined,
  phases: undefined,
  stepLabel: 'Phase',
  preview: 4,
  exclude: () => ['roadmap']
})

const { navigation, title: courseTitle } = useCourse()

const autoPhases = computed<RoadmapPhase[]>(() =>
  navigation.value
    .filter((s: ContentNavigationItem) => s.children?.length)
    .map((s: ContentNavigationItem) => ({
      title: s.title,
      description: s.description as string | undefined,
      icon: s.icon as string | undefined,
      topics: s.children!
        .filter(l => !props.exclude.includes(l.path.split('/').pop() ?? ''))
        .map(l => ({ title: l.title, to: l.path }))
    }))
    .filter(p => p.topics.length)
)

const list = computed(() => props.phases?.length ? props.phases : autoPhases.value)
const heading = computed(() => props.title ?? `${courseTitle.value} Roadmap`)

type Status = 'done' | 'current' | 'upcoming'

// Full static class strings so Tailwind can detect them
const themes = [
  { border: 'border-amber-400', text: 'text-amber-500 dark:text-amber-400', solid: 'bg-amber-400', tint: 'bg-amber-400/10', soft: 'bg-amber-400/20', ring: 'ring-amber-400/30' },
  { border: 'border-rose-400', text: 'text-rose-500 dark:text-rose-400', solid: 'bg-rose-400', tint: 'bg-rose-400/10', soft: 'bg-rose-400/20', ring: 'ring-rose-400/30' },
  { border: 'border-violet-400', text: 'text-violet-500 dark:text-violet-400', solid: 'bg-violet-400', tint: 'bg-violet-400/10', soft: 'bg-violet-400/20', ring: 'ring-violet-400/30' },
  { border: 'border-cyan-400', text: 'text-cyan-600 dark:text-cyan-400', solid: 'bg-cyan-400', tint: 'bg-cyan-400/10', soft: 'bg-cyan-400/20', ring: 'ring-cyan-400/30' },
  { border: 'border-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', solid: 'bg-emerald-400', tint: 'bg-emerald-400/10', soft: 'bg-emerald-400/20', ring: 'ring-emerald-400/30' },
  { border: 'border-orange-400', text: 'text-orange-500 dark:text-orange-400', solid: 'bg-orange-400', tint: 'bg-orange-400/10', soft: 'bg-orange-400/20', ring: 'ring-orange-400/30' }
]
const theme = (i: number) => themes[i % themes.length]!

const stats = computed(() => {
  let found = false
  return list.value.map((p) => {
    const total = p.topics.length
    const completed = p.topics.filter(t => t.done).length
    let status: Status = 'upcoming'
    if (total && completed === total) status = 'done'
    else if (!found) {
      status = 'current'
      found = true
    }
    return { status, total, completed, percent: total ? Math.round((completed / total) * 100) : 0 }
  })
})

const overall = computed(() => {
  const all = list.value.flatMap(p => p.topics)
  return all.length ? Math.round((all.filter(t => t.done).length / all.length) * 100) : 0
})

const pad = (n: number) => String(n).padStart(2, '0')
const left = (i: number) => i % 2 === 0

const statusIcon: Record<Status, string> = {
  done: 'i-lucide-circle-check',
  current: 'i-lucide-circle-play',
  upcoming: 'i-lucide-lock'
}
const statusLabel: Record<Status, string> = { done: 'Completed', current: 'In progress', upcoming: 'Upcoming' }
const statusColor: Record<Status, 'success' | 'primary' | 'neutral'> = { done: 'success', current: 'primary', upcoming: 'neutral' }

/* expand / collapse */
const open = ref<Set<number>>(new Set())
watch(stats, (s) => {
  if (!open.value.size) {
    const cur = s.findIndex(x => x.status === 'current')
    open.value = new Set([cur === -1 ? 0 : cur])
  }
}, { immediate: true })
const isOpen = (i: number) => open.value.has(i)
const toggle = (i: number) => {
  const next = new Set(open.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  open.value = next
}
const visibleTopics = (phase: RoadmapPhase, i: number) =>
  isOpen(i) ? phase.topics : phase.topics.slice(0, props.preview)
const allOpen = computed(() => list.value.length > 0 && open.value.size === list.value.length)
const toggleAll = () => {
  open.value = allOpen.value ? new Set() : new Set(list.value.map((_, i) => i))
}
</script>

<template>
  <section class="not-prose my-8 space-y-8">
    <!-- header -->
    <div class="text-center">
      <!-- <h2 class="inline-block rounded-full border-2 border-default px-6 py-2.5 text-lg font-bold text-highlighted sm:px-8 sm:py-3 sm:text-2xl">
        {{ heading }}
      </h2> -->
      <p v-if="description" class="mt-2 text-sm text-muted">
        {{ description }}
      </p>
      <!-- <div class="mx-auto mt-4 flex max-w-sm items-center gap-3">
        <UProgress :model-value="overall" class="flex-1" />
        <span class="text-xs text-muted tabular-nums">{{ overall }}%</span>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          :icon="allOpen ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down'"
          :label="allOpen ? 'Collapse all' : 'Expand all'"
          @click="toggleAll"
        />
      </div> -->
    </div>

    <p v-if="!list.length" class="text-center text-sm text-muted">
      No sections found for this course yet.
    </p>

    <!-- ===== Desktop (lg+): snake ===== -->
    <div v-if="list.length" class="hidden pt-10 pb-12 lg:block">
      <div
        v-for="(phase, i) in list"
        :key="phase.title"
        class="group/row relative grid min-h-44 grid-cols-2"
        :class="i > 0 && '-mt-3'"
      >
        <!-- half-loop: grows with content, curves keep a fixed radius -->
        <button
          type="button"
          class="absolute inset-y-0 z-10 flex w-36 cursor-pointer items-center border-y-12 transition-opacity duration-300 focus:outline-none"
          :class="[
            theme(i).border,
            left(i) ? 'right-1/2 justify-end rounded-l-[5.5rem] border-l-12 pr-3' : 'left-1/2 justify-start rounded-r-[5.5rem] border-r-12 pl-3',
            stats[i]!.status === 'upcoming' ? 'opacity-50 hover:opacity-80' : ''
          ]"
          :aria-expanded="isOpen(i)"
          :aria-label="`Toggle ${phase.title}`"
          @click="toggle(i)"
        >
          <span class="transition-transform duration-200 group-hover/row:scale-110" :class="left(i) ? 'text-right' : 'text-left'">
            <span class="block text-xs font-semibold tracking-wide text-muted uppercase">{{ stepLabel }}</span>
            <span class="block text-3xl leading-none font-extrabold text-highlighted">{{ pad(i + 1) }}</span>
          </span>
        </button>

        <!-- icon across the centre line -->
        <div
          class="absolute top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 group-hover/row:scale-110"
          :class="[theme(i).soft, theme(i).text, left(i) ? 'left-1/2 ml-5' : 'right-1/2 mr-5']"
        >
          <UIcon :name="phase.icon || statusIcon[stats[i]!.status]" class="size-6" />
        </div>

        <!-- content card on the loop side -->
        <div
          class="my-3 rounded-2xl py-5 transition-shadow duration-200 group-hover/row:shadow-lg"
          :class="[theme(i).tint, left(i) ? 'col-start-1 rounded-r-none pr-44 pl-6' : 'col-start-2 rounded-l-none pr-6 pl-44']"
        >
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-semibold text-highlighted">
              {{ phase.title }}
            </h3>
            <!-- <UBadge
              :color="statusColor[stats[i]!.status]"
              variant="subtle"
              size="sm"
              :icon="statusIcon[stats[i]!.status]"
              :label="`${stats[i]!.completed}/${stats[i]!.total} · ${statusLabel[stats[i]!.status]}`"
            /> -->
          </div>
          <p v-if="phase.description" class="mt-1 text-sm text-muted">
            {{ phase.description }}
          </p>

          <ol class="mt-3 space-y-0.5 text-sm">
            <li v-for="(t, n) in visibleTopics(phase, i)" :key="t.title">
              <ULink
                :to="t.to"
                class="group/item flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-default/70"
                :class="t.done ? 'text-muted' : 'text-default'"
              >
                <span
                  class="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  :class="t.done ? [theme(i).solid, 'text-white'] : [theme(i).soft, theme(i).text]"
                >
                  <UIcon v-if="t.done" name="i-lucide-check" class="size-3" />
                  <template v-else>{{ n + 1 }}</template>
                </span>
                <span class="flex-1" :class="t.done && 'line-through'">{{ t.title }}</span>
                <UIcon
                  v-if="t.to"
                  name="i-lucide-arrow-right"
                  class="size-4 -translate-x-1 text-dimmed opacity-0 transition group-hover/item:translate-x-0 group-hover/item:opacity-100"
                />
              </ULink>
            </li>
          </ol>

          <UButton
            v-if="phase.topics.length > preview"
            class="mt-1"
            size="xs"
            variant="link"
            color="neutral"
            :trailing-icon="isOpen(i) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            :label="isOpen(i) ? 'Show less' : `Show all ${phase.topics.length} lessons`"
            @click="toggle(i)"
          />

          <p v-if="phase.milestone" class="mt-2 flex items-center gap-2 text-sm font-medium" :class="theme(i).text">
            <UIcon name="i-lucide-trophy" class="size-4 shrink-0" /> {{ phase.milestone }}
          </p>
        </div>

        <!-- Start / End caps -->
        <span
          v-if="i === 0"
          class="absolute top-0 left-1/2 z-20 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ring-8"
          :class="[theme(0).solid, theme(0).ring]"
        >Start</span>
        <span
          v-if="i === list.length - 1"
          class="absolute bottom-0 left-1/2 z-20 flex size-16 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ring-8"
          :class="[theme(i).solid, theme(i).ring]"
        >End</span>
      </div>
    </div>

    <!-- ===== Mobile / tablet: vertical timeline ===== -->
    <ol v-if="list.length" class="space-y-4 lg:hidden">
      <li v-for="(phase, i) in list" :key="phase.title" class="relative pl-12">
        <span
          v-if="i < list.length - 1"
          class="absolute top-10 -bottom-4 left-4 w-1.5 rounded-full"
          :class="theme(i).solid"
        />
        <span
          class="absolute top-1 left-0 flex size-9.5 items-center justify-center rounded-full text-xs font-bold text-white ring-4"
          :class="[theme(i).solid, theme(i).ring]"
        >{{ pad(i + 1) }}</span>

        <div class="overflow-hidden rounded-xl" :class="theme(i).tint">
          <button
            type="button"
            class="flex w-full items-center gap-3 p-4 text-left"
            :aria-expanded="isOpen(i)"
            @click="toggle(i)"
          >
            <UIcon :name="phase.icon || statusIcon[stats[i]!.status]" class="size-5 shrink-0" :class="theme(i).text" />
            <span class="min-w-0 flex-1">
              <span class="block text-xs font-semibold text-muted uppercase">
                {{ stepLabel }} {{ pad(i + 1) }} · {{ stats[i]!.completed }}/{{ stats[i]!.total }}
              </span>
              <span class="block font-semibold text-highlighted">{{ phase.title }}</span>
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-5 shrink-0 text-muted transition-transform duration-200"
              :class="isOpen(i) && 'rotate-180'"
            />
          </button>

          <div v-if="isOpen(i)" class="px-4 pb-4">
            <ol class="space-y-0.5 text-sm">
              <li v-for="(t, n) in phase.topics" :key="t.title">
                <ULink
                  :to="t.to"
                  class="flex items-center gap-2.5 rounded-md px-2 py-2 active:bg-default/70"
                  :class="t.done ? 'text-muted' : 'text-default'"
                >
                  <span
                    class="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    :class="t.done ? [theme(i).solid, 'text-white'] : [theme(i).soft, theme(i).text]"
                  >
                    <UIcon v-if="t.done" name="i-lucide-check" class="size-3" />
                    <template v-else>{{ n + 1 }}</template>
                  </span>
                  <span :class="t.done && 'line-through'">{{ t.title }}</span>
                </ULink>
              </li>
            </ol>
            <p v-if="phase.milestone" class="mt-2 flex items-center gap-2 text-sm font-medium" :class="theme(i).text">
              <UIcon name="i-lucide-trophy" class="size-4" /> {{ phase.milestone }}
            </p>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>
