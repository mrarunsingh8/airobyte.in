<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageChildren } from '@nuxt/content/utils'
import { interviewQuestions } from '~/data/interviewQuestions'

// Everything below is built from content/learn/<course>/ — add a course folder and it appears
// in the course list, the topic grid, the learning paths and (if it has questions) the revision section.
const { data } = await useAsyncData('home-courses', () => queryCollectionNavigation('learn', ['description']))

function countLessons(items: ContentNavigationItem[] = []): number {
  return items.reduce((n, item) => n + (item.children?.length ? countLessons(item.children) : 1), 0)
}

function allLessons(items: ContentNavigationItem[] = []): string[] {
  return items.flatMap(item => item.children?.length ? allLessons(item.children) : (item.page === false ? [] : [toPublicPath(item.path)]))
}

function firstLesson(items: ContentNavigationItem[] = []): ContentNavigationItem | undefined {
  for (const item of items) {
    if (item.children?.length) {
      const hit = firstLesson(item.children)
      if (hit) return hit
    } else if (item.page !== false) {
      return item
    }
  }
}

// "Everything in one place": the usual way vs AiroByte
const messyTabs = ['JS tutorial (2019)', 'Stack Overflow', 'notes_final_v3', 'Video 14 of 86', 'Blog: closures', 'Interview Qs PDF', 'Docs', 'Forum thread', 'Cheat sheet']
const before = [
  'Twenty tabs open, none of them finished',
  'Notes scattered across apps and notebooks',
  'No idea what to learn, or revise, next',
  'Examples you can only read, not run',
  'Starting over every time an interview comes up'
]
const after = [
  'Every lesson in one place, in the right order',
  'A clear roadmap from your first step onwards',
  'Run and change every example in your browser',
  'Your progress and favourites saved as you go',
  'Key takeaways ready for quick revision'
]

const courses = computed(() => findPageChildren(data.value ?? [], '/learn').map((course) => {
  const slug = course.path.split('/').pop() ?? ''
  const start = firstLesson(course.children)
  const modules = (course.children ?? [])
    .filter(child => child.children?.length)
    .map((section) => {
      const first = firstLesson(section.children)
      return {
        key: section.path,
        title: section.title,
        icon: (section.icon as string | undefined) || 'i-lucide-folder',
        to: first ? toPublicPath(first.path) : undefined,
        lessons: countLessons(section.children)
      }
    })
  return {
    slug,
    path: course.path,
    start: start ? toPublicPath(start.path) : course.path,
    firstLesson: start ? { title: start.title, description: start.description as string | undefined } : undefined,
    title: course.title,
    description: course.description as string | undefined,
    icon: (course.icon as string | undefined) || 'i-lucide-book-open',
    modules,
    lessonPaths: allLessons(course.children),
    lessons: countLessons(course.children)
  }
}))

const featured = computed(() => courses.value[0])

// The visitor's own progress per course (saved in the browser for now, see useProgress)
const { isCompleted } = useProgress()
const courseProgress = computed(() => Object.fromEntries(courses.value.map((course) => {
  const done = course.lessonPaths.filter(path => isCompleted(path)).length
  const next = course.lessonPaths.find(path => !isCompleted(path)) ?? course.start
  return [course.slug, { done, next, percent: course.lessonPaths.length ? Math.round((done / course.lessonPaths.length) * 100) : 0 }]
})))

const includes = ['A step-by-step roadmap', 'Short, story-driven lessons', 'Code you can run in the browser', 'Progress tracking and favourites', 'Key takeaways for quick revision']
const multipleCourses = computed(() => courses.value.length > 1)

const revisionTabs = computed(() => courses.value
  .filter(course => interviewQuestions[course.slug]?.length)
  .map(course => ({ label: course.title, icon: course.icon, value: course.slug, questions: interviewQuestions[course.slug]! })))

useSeoMeta({
  title: 'Learn to code, step by step',
  description: 'Beginner-friendly programming courses. Go from zero to hero with short lessons, real-life examples and code you can run in your browser, and come back to brush up before every interview.'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="relative overflow-hidden">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--ui-color-primary-500)_0%,transparent_70%)] opacity-15 dark:opacity-25"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--ui-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--ui-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] bg-size-[48px_48px]"
      />

      <UPageHero
        orientation="horizontal"
        :ui="{ title: 'text-5xl sm:text-6xl lg:text-7xl', container: 'lg:py-32' }"
      >
        <template #headline>
          <UBadge
            label="Courses for absolute beginners"
            icon="i-lucide-sparkles"
            variant="subtle"
            class="rounded-full"
          />
        </template>

        <template #title>
          Learn to code.<br>
          <span class="text-primary">From zero to hero.</span>
        </template>

        <template #description>
          Short, friendly lessons that start from the very first line of code. Real-life examples, code you can run in your browser, and a clear path all the way to mastery.
        </template>

        <template #links>
          <UButton
            v-if="featured"
            :to="featured.start"
            :label="`Start ${featured.title}`"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
          />
          <UButton
            to="#courses"
            label="Browse courses"
            icon="i-lucide-library"
            color="neutral"
            variant="subtle"
            size="xl"
          />
        </template>

        <!-- Code window visual -->
        <div class="relative">
          <div aria-hidden="true" class="absolute -inset-6 -z-10 rounded-3xl bg-primary/20 blur-3xl" />
          <div class="rounded-xl border border-default bg-default/80 shadow-xl backdrop-blur ring-1 ring-default">
            <div class="flex items-center gap-2 border-b border-default px-4 py-3">
              <span class="size-3 rounded-full bg-red-400" />
              <span class="size-3 rounded-full bg-amber-400" />
              <span class="size-3 rounded-full bg-green-400" />
              <span class="ml-3 font-mono text-xs text-muted">lesson-01.js</span>
              <UBadge label="Run" icon="i-lucide-play" size="sm" variant="soft" class="ml-auto" />
            </div>
            <pre class="overflow-x-auto p-5 font-mono text-sm leading-7"><code><span class="text-muted">// Your first JavaScript program</span>
<span class="text-primary">let</span> ticketPrice = <span class="text-amber-500">150</span>;
<span class="text-primary">let</span> tickets = <span class="text-amber-500">4</span>;

<span class="text-primary">let</span> total = ticketPrice * tickets;

console.<span class="text-sky-500">log</span>(<span class="text-green-600 dark:text-green-400">"Total: ₹"</span> + total);</code></pre>
            <div class="border-t border-default px-5 py-3 font-mono text-sm">
              <span class="text-muted">›</span> <span class="text-highlighted">Total: ₹600</span>
            </div>
          </div>
        </div>
      </UPageHero>
    </div>

    <!-- Courses -->
    <UPageSection
      id="courses"
      headline="Courses"
      title="Start with a course"
      description="Every course begins at the very first step and follows one clear road to the advanced topics. Pick one, learn at your own pace, and pick up exactly where you left off."
      orientation="horizontal"
      reverse
      :ui="{ container: 'lg:items-start' }"
    >
      <!-- the section's features list is already a <ul>, so only <li>s go here -->
      <template #features>
        <li v-for="item in includes" :key="item" class="flex items-center gap-3 text-muted">
          <UIcon name="i-lucide-check" class="size-5 shrink-0 text-primary" />
          {{ item }}
        </li>
      </template>

      <div class="space-y-6">
        <!-- one card per course -->
        <UPageCard
          v-for="course in courses"
          :key="course.path"
          :to="courseProgress[course.slug]?.done ? courseProgress[course.slug]?.next : course.start"
          spotlight
          spotlight-color="primary"
          class="group"
          :ui="{ container: 'p-6 sm:p-8 gap-y-6' }"
        >
          <div class="flex items-start gap-4">
            <span class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
              <UIcon :name="course.icon" class="size-8 text-primary" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-bold text-highlighted">
                  {{ course.title }}
                </h3>
                <UBadge label="Beginner friendly" color="success" variant="subtle" size="sm" />
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ course.modules.length }} modules · {{ course.lessons }} lessons
              </p>
            </div>
          </div>

          <p class="text-muted">
            {{ course.description || `Learn ${course.title} step by step, from the fundamentals up.` }}
          </p>

          <!-- the course's modules as a little road of stops -->
          <div class="flex items-center">
            <template v-for="(module, i) in course.modules.slice(0, 7)" :key="module.key">
              <UTooltip :text="module.title">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated ring-1 ring-default transition-colors group-hover:ring-primary/40">
                  <UIcon :name="module.icon" class="size-4 text-muted" />
                </span>
              </UTooltip>
              <span v-if="i < Math.min(course.modules.length, 7) - 1" class="h-px min-w-3 flex-1 border-t-2 border-dashed border-accented" />
            </template>
            <span v-if="course.modules.length > 7" class="ml-2 shrink-0 text-xs font-medium text-muted">
              +{{ course.modules.length - 7 }}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 border-t border-default pt-6">
            <div v-if="courseProgress[course.slug]?.done" class="min-w-48 flex-1">
              <div class="flex justify-between text-sm">
                <span class="text-muted">Your progress</span>
                <span class="font-medium text-highlighted">{{ courseProgress[course.slug]?.percent }}%</span>
              </div>
              <UProgress :model-value="courseProgress[course.slug]?.percent" size="sm" class="mt-2" />
            </div>
            <p v-else class="text-sm text-muted">
              Starts from lesson one. No experience needed.
            </p>

            <UButton
              :label="courseProgress[course.slug]?.done ? 'Continue' : 'Start course'"
              trailing-icon="i-lucide-arrow-right"
              tabindex="-1"
              class="pointer-events-none"
            />
          </div>
        </UPageCard>

        <!-- more on the way: stacked blank course covers -->
        <div class="flex items-center gap-6 rounded-xl border-2 border-dashed border-default p-6">
          <div class="relative h-16 w-20 shrink-0" aria-hidden="true">
            <span class="absolute left-0 top-2 size-12 -rotate-12 rounded-xl bg-elevated ring-1 ring-default" />
            <span class="absolute left-3 top-1 size-12 -rotate-3 rounded-xl bg-elevated ring-1 ring-default" />
            <span class="absolute left-6 top-0 flex size-12 rotate-6 items-center justify-center rounded-xl bg-default ring-1 ring-default">
              <UIcon name="i-lucide-plus" class="size-5 text-dimmed" />
            </span>
          </div>
          <div>
            <p class="font-semibold text-highlighted">
              More courses on the way
            </p>
            <p class="text-sm text-muted">
              New courses are being written, and each one follows the same road you see here.
            </p>
          </div>
        </div>
      </div>
    </UPageSection>

    <!-- Everything in one place -->
    <UPageSection class="bg-elevated/40" orientation="horizontal">
      <template #title>
        Everything you need, <span class="bg-[linear-gradient(transparent_62%,var(--ui-color-primary-200)_62%)] dark:bg-[linear-gradient(transparent_62%,var(--ui-color-primary-800)_62%)]">in one place</span>
      </template>
      <template #description>
        No more twenty open tabs, scattered notes and half-finished playlists.
        Every course comes with the same set of tools, so learning something new
        always feels familiar, and coming back to revise takes minutes, not hours.
      </template>

      <div class="relative grid gap-10">
        <!-- Before: the usual way -->
        <UCard variant="subtle" :ui="{ header: 'p-0 sm:p-0', body: 'sm:p-8' }" class="opacity-90">
          <template #header>
            <div class="flex items-center gap-1.5 overflow-hidden px-3 pt-3">
              <span class="mr-2 flex shrink-0 gap-1.5">
                <span class="size-2.5 rounded-full bg-accented" />
                <span class="size-2.5 rounded-full bg-accented" />
                <span class="size-2.5 rounded-full bg-accented" />
              </span>
              <span
                v-for="tab in messyTabs"
                :key="tab"
                class="w-24 shrink-0 truncate rounded-t-md border border-b-0 border-default bg-default px-2 py-1 text-[11px] text-muted"
              >{{ tab }}</span>
            </div>
          </template>

          <p class="text-sm font-medium text-muted">
            The usual way
          </p>
          <ul class="mt-4 space-y-3">
            <li v-for="item in before" :key="item" class="flex gap-3 text-muted">
              <UIcon name="i-lucide-circle-x" class="mt-0.5 size-5 shrink-0 text-error" />
              <span class="line-through decoration-error/40">{{ item }}</span>
            </li>
          </ul>
        </UCard>

        <!-- arrow between the two -->
        <div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span class="flex size-12 items-center justify-center rounded-full bg-primary text-inverted shadow-lg ring-8 ring-(--ui-bg-elevated)">
            <UIcon name="i-lucide-arrow-down" class="size-6" />
          </span>
        </div>

        <!-- After: AiroByte -->
        <UCard :ui="{ root: 'ring-2 ring-primary shadow-xl shadow-primary/10', header: 'p-0 sm:p-0', body: 'sm:p-8' }">
          <template #header>
            <div class="flex items-center gap-1.5 px-3 pt-3">
              <span class="mr-2 flex shrink-0 gap-1.5">
                <span class="size-2.5 rounded-full bg-red-400" />
                <span class="size-2.5 rounded-full bg-amber-400" />
                <span class="size-2.5 rounded-full bg-green-400" />
              </span>
              <span class="flex items-center gap-1.5 rounded-t-md border border-b-0 border-default bg-default px-3 py-1 text-xs font-medium text-highlighted">
                <img src="/logos/favicon-32.png" alt="" class="size-3.5">
                AiroByte
              </span>
            </div>
          </template>

          <p class="text-sm font-medium text-primary">
            Learning on AiroByte
          </p>
          <ul class="mt-4 space-y-3">
            <li v-for="item in after" :key="item" class="flex gap-3 text-highlighted">
              <UIcon name="i-lucide-circle-check-big" class="mt-0.5 size-5 shrink-0 text-success" />
              {{ item }}
            </li>
          </ul>
        </UCard>
      </div>
    </UPageSection>

    <!-- Roadmap -->
    <UPageSection
      id="roadmap"
      headline="The roadmap"
      title="A learning path built around how you actually learn"
      description="Every course follows the same road: start from zero, learn through stories, practise as you go, and come back to revise whenever you need."
      :ui="{ container: 'pb-8 lg:pb-8 sm:pb-8' }"
    />
    <!-- full width, outside the page container -->
    <RoadmapRoad class="mb-16" />

    <!-- Read -->
    <UPageSection
      headline="Read it"
      title="Short lessons, explained with everyday life"
      description="Every lesson covers one idea, in plain English. Concepts are explained through things you already know, like booking cinema seats, filling a shopping cart or adding up exam marks."
      orientation="horizontal"
      reverse
      class="bg-elevated/40"
    >
      <UPageCard
        v-if="featured?.firstLesson"
        :to="featured.start"
        :title="featured.firstLesson.title"
        :description="featured.firstLesson.description"
        variant="subtle"
        spotlight
        :ui="{ title: 'text-2xl', description: 'text-base' }"
      >
        <template #header>
          <div class="flex items-center gap-2 text-sm text-muted">
            <UIcon :name="featured.icon" class="size-4" />
            {{ featured.title }} · Lesson 1
          </div>
        </template>
        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UBadge label="Short read" color="neutral" variant="subtle" icon="i-lucide-clock" />
            <UBadge label="Beginner" color="neutral" variant="subtle" icon="i-lucide-signal-low" />
            <UBadge label="Real-life example" color="neutral" variant="subtle" icon="i-lucide-lightbulb" />
          </div>
        </template>
      </UPageCard>
    </UPageSection>

    <!-- Run -->
    <UPageSection
      headline="Run it"
      title="Change the code and see what happens"
      description="Examples come with a playground built in. Change a value, break something on purpose, press Run. Nothing to install, and nothing you do can break your computer."
      orientation="horizontal"
    >
      <UCard :ui="{ header: 'flex items-center gap-2 py-3', body: 'p-0 sm:p-0', footer: 'py-3 font-mono text-sm' }">
        <template #header>
          <UIcon name="i-lucide-square-terminal" class="size-4 text-muted" />
          <span class="text-sm font-medium">Playground</span>
          <UButton label="Run" icon="i-lucide-play" size="xs" class="ml-auto" tabindex="-1" />
        </template>
        <pre class="overflow-x-auto bg-muted px-5 py-4 font-mono text-sm leading-7"><code><span class="text-dimmed">// Change any number and press Run</span>
cart = [<span class="text-amber-600 dark:text-amber-400">499</span>, <span class="text-amber-600 dark:text-amber-400">1299</span>, <span class="text-amber-600 dark:text-amber-400">250</span>]
total = <span class="text-sky-600 dark:text-sky-400">sum</span>(cart)

<span class="text-sky-600 dark:text-sky-400">print</span>(<span class="text-green-700 dark:text-green-400">"Pay ₹"</span> + total)</code></pre>
        <template #footer>
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-success" />
            <span class="text-highlighted">Pay ₹2048</span>
            <span class="ml-auto text-xs text-dimmed">done · 3 ms</span>
          </div>
        </template>
      </UCard>
    </UPageSection>

    <!-- Revise -->
    <UPageSection
      headline="Revise it"
      title="Track what you've done, revise what you've forgotten"
      description="Mark lessons as complete, star the ones you want to come back to, and skim the key takeaways at the end of every lesson the night before an interview."
      orientation="horizontal"
      reverse
      class="bg-elevated/40"
    >
      <UCard v-if="featured">
        <div class="flex items-center justify-between gap-2">
          <p class="font-semibold text-highlighted">
            {{ featured.title }}
          </p>
          <span class="text-sm text-muted">Your progress</span>
        </div>
        <UProgress :model-value="40" size="sm" class="mt-3" />
        <ul class="mt-5 space-y-3">
          <li v-for="(module, i) in featured.modules.slice(0, 5)" :key="module.key" class="flex items-center gap-3">
            <UIcon
              :name="i < 2 ? 'i-lucide-circle-check-big' : 'i-lucide-circle'"
              class="size-5 shrink-0"
              :class="i < 2 ? 'text-success' : 'text-dimmed'"
            />
            <span class="flex-1 text-sm" :class="i < 2 ? 'text-success' : 'text-highlighted'">{{ module.title }}</span>
            <UIcon v-if="i === 1 || i === 3" name="i-custom-star-filled" class="size-4 text-amber-500" />
          </li>
        </ul>
      </UCard>
    </UPageSection>

    <!-- Interview quick revision -->
    <UPageSection
      v-if="revisionTabs.length"
      headline="Interview quick revision"
      title="Questions you'll almost certainly be asked"
      description="A taste of what the courses cover. Each answer links to the full lesson, with examples you can run."
      orientation="horizontal"
    >
      <UTabs
        :items="revisionTabs"
        :default-value="revisionTabs[0]?.value"
        variant="link"
        class="w-full"
        :ui="{ list: revisionTabs.length > 1 ? 'justify-center' : 'hidden', content: 'pt-6' }"
      >
        <template #content="{ item }">
          <UAccordion
            :items="item.questions"
            type="multiple"
            :ui="{ trigger: 'text-base py-4', body: 'text-base text-muted' }"
          >
            <template #body="{ item: question }">
              <p>{{ question.content }}</p>
              <UButton
                :to="question.to"
                label="Read the full lesson"
                trailing-icon="i-lucide-arrow-right"
                variant="link"
                class="mt-2 px-0"
              />
            </template>
          </UAccordion>
        </template>
      </UTabs>
    </UPageSection>

    <!-- CTA -->
    <UPageSection>
      <UPageCTA
        title="Your first lesson is five minutes away"
        description="No installs, no setup. Start from lesson one, or jump into the learning path and brush up on what you need."
        variant="solid"
        :links="[
          ...(featured ? [{ label: multipleCourses ? 'Browse courses' : `Start ${featured.title}`, to: multipleCourses ? '#courses' : featured.start, trailingIcon: 'i-lucide-arrow-right', size: 'xl' as const, color: 'neutral' as const }] : []),
          { label: 'See the learning path', to: '#roadmap', icon: 'i-lucide-map', size: 'xl' as const, color: 'neutral' as const, variant: 'subtle' as const }
        ]"
      />
    </UPageSection>
  </div>
</template>
