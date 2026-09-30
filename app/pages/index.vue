<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageChildren } from '@nuxt/content/utils'

// Courses come straight from content/learn/<course>/ — add a folder and it shows up here.
const { data } = await useAsyncData('home-courses', () => queryCollectionNavigation('learn', ['description']))

function countLessons(items: ContentNavigationItem[] = []): number {
  return items.reduce((n, item) => n + (item.children?.length ? countLessons(item.children) : 1), 0)
}

function firstLesson(items: ContentNavigationItem[] = []): string | undefined {
  for (const item of items) {
    if (item.children?.length) {
      const hit = firstLesson(item.children)
      if (hit) return hit
    } else if (item.page !== false) {
      return item.path
    }
  }
}

const courses = computed(() => findPageChildren(data.value ?? [], '/learn').map((course) => {
  const sections = course.children?.filter(child => child.children?.length) ?? []
  const start = firstLesson(course.children)
  return {
    path: course.path,
    start: start ? toPublicPath(start) : course.path,
    title: course.title,
    description: course.description as string | undefined,
    icon: (course.icon as string | undefined) || 'i-lucide-book-open',
    sections: sections.map(section => ({
      title: section.title,
      icon: (section.icon as string | undefined) || 'i-lucide-folder',
      lessons: countLessons(section.children)
    })),
    lessons: countLessons(course.children)
  }
}))

// The flagship course drives the hero button and the curriculum preview
const featured = computed(() => courses.value.find(c => c.path === '/learn/javascript') ?? courses.value[0])
const totalLessons = computed(() => courses.value.reduce((n, c) => n + c.lessons, 0))

const stats = computed(() => [
  { value: courses.value.length, label: courses.value.length === 1 ? 'Course' : 'Courses' },
  { value: `${totalLessons.value}+`, label: 'Lessons' },
  { value: '₹0', label: 'Always free' }
])

const features = [{
  icon: 'i-lucide-footprints',
  title: 'Step by step, from zero',
  description: 'No prior coding needed. Every lesson builds on the last, so you never hit a wall of unexplained jargon.'
}, {
  icon: 'i-lucide-square-terminal',
  title: 'Run code as you read',
  description: 'Built-in playgrounds let you edit and run every example right in the browser. No setup, no installs.'
}, {
  icon: 'i-lucide-ticket',
  title: 'Real-life examples',
  description: 'Cinema tickets, shopping carts, exam results: concepts are taught through situations you already understand.'
}, {
  icon: 'i-lucide-map',
  title: 'A clear roadmap',
  description: 'See the whole path up front and always know where you are, what comes next and why it matters.'
}, {
  icon: 'i-lucide-list-checks',
  title: 'Key takeaways',
  description: 'Every lesson ends with a short summary, so revising before an interview takes minutes, not hours.'
}, {
  icon: 'i-lucide-moon-star',
  title: 'Comfortable to read',
  description: 'Clean typography, light and dark modes, and full-text search across every course.'
}]

const steps = [{
  icon: 'i-lucide-compass',
  title: 'Pick a course',
  description: 'Start with JavaScript. More courses are on the way.'
}, {
  icon: 'i-lucide-book-open-text',
  title: 'Read a short lesson',
  description: 'Bite-sized pages, each focused on one idea.'
}, {
  icon: 'i-lucide-play',
  title: 'Run and tweak the code',
  description: 'Change the numbers, break things, see what happens.'
}, {
  icon: 'i-lucide-trophy',
  title: 'Move on with confidence',
  description: 'Recap the takeaways, then unlock the next topic.'
}]

useSeoMeta({
  title: 'Learn to code, step by step',
  description: 'Free, beginner-friendly programming courses. Start with JavaScript and go from zero to hero with short lessons, real-life examples and code you can run in your browser.'
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
            label="Free courses for absolute beginners"
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

    <!-- Stats -->
    <UContainer>
      <div class="grid grid-cols-3 divide-x divide-default rounded-xl border border-default bg-elevated/40">
        <div v-for="stat in stats" :key="stat.label" class="px-4 py-6 text-center">
          <p class="text-3xl font-bold text-highlighted sm:text-4xl">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ stat.label }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- Courses -->
    <UPageSection
      id="courses"
      headline="Courses"
      title="Pick your path"
      description="Every course starts from the basics and builds up one small step at a time. New courses are added regularly."
    >
      <UPageGrid>
        <UPageCard
          v-for="course in courses"
          :key="course.path"
          :to="course.start"
          spotlight
          class="group"
        >
          <template #leading>
            <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/25">
              <UIcon :name="course.icon" class="size-6 text-primary" />
            </div>
          </template>
          <template #title>
            <span class="text-lg">{{ course.title }}</span>
          </template>
          <template #description>
            <p class="line-clamp-3">
              {{ course.description || `Learn ${course.title} step by step, from the fundamentals up.` }}
            </p>
          </template>
          <template #footer>
            <div class="flex items-center justify-between gap-2">
              <div class="flex flex-wrap gap-1.5">
                <UBadge :label="`${course.lessons} lessons`" color="neutral" variant="subtle" icon="i-lucide-file-text" />
                <UBadge label="Beginner" color="neutral" variant="subtle" icon="i-lucide-signal-low" />
              </div>
              <UIcon name="i-lucide-arrow-right" class="size-5 text-primary transition-transform group-hover:translate-x-1" />
            </div>
          </template>
        </UPageCard>

        <UPageCard
          title="More coming soon"
          description="New courses are in the works. Master JavaScript now and you'll be ready for what's next."
          icon="i-lucide-hourglass"
          variant="outline"
          class="border-dashed"
          :ui="{ root: 'ring-dashed' }"
        />
      </UPageGrid>
    </UPageSection>

    <!-- Curriculum preview for the flagship course -->
    <UPageSection
      v-if="featured?.sections.length"
      :headline="`${featured.title} curriculum`"
      title="Your roadmap from zero to hero"
      description="Follow the modules in order. Each one is a handful of short lessons with runnable examples."
      class="bg-elevated/30"
    >
      <ol class="relative mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
        <li
          v-for="(section, index) in featured.sections"
          :key="section.title"
          class="flex items-center gap-4 rounded-xl border border-default bg-default p-4 transition hover:border-primary/50"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-inverted">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-highlighted">
              {{ section.title }}
            </p>
            <p class="text-sm text-muted">
              {{ section.lessons }} {{ section.lessons === 1 ? 'lesson' : 'lessons' }}
            </p>
          </div>
          <UIcon :name="section.icon" class="size-5 shrink-0 text-dimmed" />
        </li>
      </ol>

      <div class="flex justify-center">
        <UButton
          :to="featured.start"
          label="Begin lesson one"
          trailing-icon="i-lucide-arrow-right"
          size="lg"
        />
      </div>
    </UPageSection>

    <!-- Why -->
    <UPageSection
      headline="Why AiroByte"
      title="Built for people who are just starting out"
      description="Coding tutorials often assume you already know half of it. These courses don't."
      :features="features"
    />

    <!-- How it works -->
    <UPageSection
      headline="How it works"
      title="Learn by doing, one small step at a time"
    >
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(step, index) in steps" :key="step.title" class="relative">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-lg border border-default bg-elevated">
              <UIcon :name="step.icon" class="size-5 text-primary" />
            </div>
            <span class="font-mono text-sm text-dimmed">Step {{ index + 1 }}</span>
          </div>
          <h3 class="font-semibold text-highlighted">
            {{ step.title }}
          </h3>
          <p class="mt-1 text-sm text-muted">
            {{ step.description }}
          </p>
        </div>
      </div>
    </UPageSection>

    <!-- CTA -->
    <UPageSection>
      <UPageCTA
        title="Your first line of code is five minutes away"
        description="No sign-up, no installs, no cost. Open the first lesson and start typing."
        variant="subtle"
        class="overflow-hidden"
        :links="[
          ...(featured ? [{ label: `Start ${featured.title}`, to: featured.start, trailingIcon: 'i-lucide-arrow-right', size: 'xl' as const }] : []),
          { label: 'Open the playground', to: '/playground', icon: 'i-lucide-square-terminal', color: 'neutral' as const, variant: 'outline' as const, size: 'xl' as const }
        ]"
      />
    </UPageSection>
  </div>
</template>
